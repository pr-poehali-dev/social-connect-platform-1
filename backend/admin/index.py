import json
import os
import psycopg2
import bcrypt
from datetime import datetime, timedelta
import jwt

DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'admin-secret-key-change-in-production')
SCHEMA = 't_p19021063_social_connect_platf.'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def log_admin_action(admin_id, action, target_type=None, target_id=None, details=None, ip=None, user_agent=None):
    '''Логирование действий администратора'''
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            f"INSERT INTO {SCHEMA}admin_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (admin_id, action, target_type, target_id, json.dumps(details) if details else None, ip, user_agent)
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()

def verify_admin_token(token):
    '''Проверка JWT токена администратора'''
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except:
        return None

def handler(event: dict, context) -> dict:
    '''API для админ-панели: авторизация, управление пользователями, контентом, фильтрами'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    auth_header = headers.get('X-Authorization', headers.get('x-authorization', ''))
    token = auth_header.replace('Bearer ', '') if auth_header else None
    
    body = json.loads(event.get('body', '{}')) if event.get('body') else {}
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action') or body.get('action')
    
    ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp')
    user_agent = headers.get('user-agent', '')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Авторизация админа
        if action == 'login':
            email = body.get('email')
            password = body.get('password')
            
            cur.execute(f"SELECT id, email, password_hash, name, role, is_active FROM {SCHEMA}admins WHERE email = %s", (email,))
            admin = cur.fetchone()
            
            if not admin:
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Неверные данные'}), 'isBase64Encoded': False}
            
            admin_id, admin_email, password_hash, name, role, is_active = admin
            
            if not is_active:
                return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Аккаунт заблокирован'}), 'isBase64Encoded': False}
            
            if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Неверные данные'}), 'isBase64Encoded': False}
            
            cur.execute(f"UPDATE {SCHEMA}admins SET last_login_at = %s WHERE id = %s", (datetime.now(), admin_id))
            conn.commit()
            
            access_token = jwt.encode({
                'admin_id': admin_id,
                'email': admin_email,
                'role': role,
                'exp': datetime.utcnow() + timedelta(days=3650)
            }, JWT_SECRET, algorithm='HS256')
            
            log_admin_action(admin_id, 'login', ip=ip, user_agent=user_agent)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'access_token': access_token, 'admin': {'id': admin_id, 'email': admin_email, 'name': name, 'role': role}}),
                'isBase64Encoded': False
            }
        
        # Все остальные действия требуют авторизации
        # DEV MODE: allow 'dev-token' for development
        if token == 'dev-token':
            admin_data = {'admin_id': 1, 'email': 'admin@connecthub.ru', 'role': 'superadmin'}
            admin_id = 1
        else:
            admin_data = verify_admin_token(token)
            if not admin_data:
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется авторизация'}), 'isBase64Encoded': False}
            admin_id = admin_data['admin_id']
        
        # Дашборд - статистика
        if action == 'dashboard':
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}users")
            total_users = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}users WHERE is_vip = true")
            vip_users = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}users WHERE is_blocked = true")
            blocked_users = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}users WHERE created_at >= NOW() - INTERVAL '30 days'")
            new_users_month = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}dating_profiles")
            dating_profiles = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}ads")
            total_ads = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}services")
            total_services = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}events")
            total_events = cur.fetchone()[0]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'users': {'total': total_users, 'vip': vip_users, 'blocked': blocked_users, 'new_month': new_users_month},
                    'content': {'dating': dating_profiles, 'ads': total_ads, 'services': total_services, 'events': total_events}
                }),
                'isBase64Encoded': False
            }
        
        # Статистика по периодам для дашборда
        if action == 'dashboard_stats':
            period_type = params.get('period', 'today')
            date_from = params.get('date_from')
            date_to = params.get('date_to')
            
            if period_type == 'today':
                current_filter = "DATE(created_at) = CURRENT_DATE"
                prev_filter = "DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'"
                activity_filter = "DATE(last_login_at) = CURRENT_DATE"
                prev_activity_filter = "DATE(last_login_at) = CURRENT_DATE - INTERVAL '1 day'"
            elif period_type == 'yesterday':
                current_filter = "DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'"
                prev_filter = "DATE(created_at) = CURRENT_DATE - INTERVAL '2 day'"
                activity_filter = "DATE(last_login_at) = CURRENT_DATE - INTERVAL '1 day'"
                prev_activity_filter = "DATE(last_login_at) = CURRENT_DATE - INTERVAL '2 day'"
            elif period_type == 'month':
                current_filter = "created_at >= DATE_TRUNC('month', CURRENT_DATE)"
                prev_filter = "created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE)"
                activity_filter = "last_login_at >= DATE_TRUNC('month', CURRENT_DATE)"
                prev_activity_filter = "last_login_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND last_login_at < DATE_TRUNC('month', CURRENT_DATE)"
            elif period_type == 'year':
                current_filter = "created_at >= DATE_TRUNC('year', CURRENT_DATE)"
                prev_filter = "created_at >= DATE_TRUNC('year', CURRENT_DATE - INTERVAL '1 year') AND created_at < DATE_TRUNC('year', CURRENT_DATE)"
                activity_filter = "last_login_at >= DATE_TRUNC('year', CURRENT_DATE)"
                prev_activity_filter = "last_login_at >= DATE_TRUNC('year', CURRENT_DATE - INTERVAL '1 year') AND last_login_at < DATE_TRUNC('year', CURRENT_DATE)"
            elif period_type == 'custom' and date_from and date_to:
                current_filter = f"DATE(created_at) BETWEEN '{date_from}' AND '{date_to}'"
                prev_filter = f"DATE(created_at) BETWEEN '{date_from}'::date - ('{date_to}'::date - '{date_from}'::date + 1) AND '{date_from}'::date - 1"
                activity_filter = f"DATE(last_login_at) BETWEEN '{date_from}' AND '{date_to}'"
                prev_activity_filter = f"DATE(last_login_at) BETWEEN '{date_from}'::date - ('{date_to}'::date - '{date_from}'::date + 1) AND '{date_from}'::date - 1"
            else:
                current_filter = "DATE(created_at) = CURRENT_DATE"
                prev_filter = "DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'"
                activity_filter = "DATE(last_login_at) = CURRENT_DATE"
                prev_activity_filter = "DATE(last_login_at) = CURRENT_DATE - INTERVAL '1 day'"
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}users WHERE {current_filter}")
            new_users = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}users WHERE {prev_filter}")
            prev_new_users = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(DISTINCT id) FROM {SCHEMA}users WHERE {activity_filter}")
            active_users = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(DISTINCT id) FROM {SCHEMA}users WHERE {prev_activity_filter}")
            prev_active_users = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}users WHERE is_vip = true AND vip_expires_at > NOW()")
            paid_subscribers = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}users")
            total_users = cur.fetchone()[0]
            
            user_growth = ((new_users - prev_new_users) / prev_new_users * 100) if prev_new_users > 0 else 0
            activity_growth = ((active_users - prev_active_users) / prev_active_users * 100) if prev_active_users > 0 else 0
            
            cur.execute(f"""
                SELECT c.name, COUNT(DISTINCT u.id) as user_count
                FROM {SCHEMA}users u
                LEFT JOIN {SCHEMA}cities c ON u.city_id = c.id
                WHERE {current_filter}
                GROUP BY c.name
                ORDER BY user_count DESC
                LIMIT 10
            """)
            cities_data = cur.fetchall()
            cities = [{'city': row[0] or 'Не указан', 'new_users': row[1], 'revenue': 0, 'active_users': 0} for row in cities_data]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'stats': {
                        'new_users': new_users,
                        'revenue': 0,
                        'active_users': active_users,
                        'paid_subscribers': paid_subscribers,
                        'total_users': total_users,
                        'user_growth_percent': round(user_growth, 1),
                        'revenue_growth_percent': 0,
                        'activity_growth_percent': round(activity_growth, 1)
                    },
                    'cities': cities
                }),
                'isBase64Encoded': False
            }
        
        # Получить список пользователей
        if action == 'get_users':
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 50))
            search = params.get('search', '')
            filter_blocked = params.get('blocked')
            filter_vip = params.get('vip')
            
            offset = (page - 1) * limit
            
            query = f"SELECT id, email, name, nickname, is_vip, vip_expires_at, is_blocked, block_reason, is_verified, created_at, last_login_at FROM {SCHEMA}users WHERE 1=1"
            count_query = f"SELECT COUNT(*) FROM {SCHEMA}users WHERE 1=1"
            query_params = []
            
            if search:
                query += " AND (email ILIKE %s OR name ILIKE %s OR nickname ILIKE %s)"
                count_query += " AND (email ILIKE %s OR name ILIKE %s OR nickname ILIKE %s)"
                search_param = f'%{search}%'
                query_params.extend([search_param, search_param, search_param])
            
            if filter_blocked == 'true':
                query += " AND is_blocked = true"
                count_query += " AND is_blocked = true"
            elif filter_blocked == 'false':
                query += " AND is_blocked = false"
                count_query += " AND is_blocked = false"
            
            if filter_vip == 'true':
                query += " AND is_vip = true"
                count_query += " AND is_vip = true"
            elif filter_vip == 'false':
                query += " AND is_vip = false"
                count_query += " AND is_vip = false"
            
            cur.execute(count_query, query_params if search or filter_blocked or filter_vip else [])
            total = cur.fetchone()[0]
            
            query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
            cur.execute(query, query_params + [limit, offset])
            
            users = []
            for row in cur.fetchall():
                users.append({
                    'id': row[0], 'email': row[1], 'name': row[2], 'nickname': row[3],
                    'is_vip': row[4], 'vip_expires_at': row[5].isoformat() if row[5] else None,
                    'is_blocked': row[6], 'block_reason': row[7], 'is_verified': row[8],
                    'created_at': row[9].isoformat() if row[9] else None,
                    'last_login_at': row[10].isoformat() if row[10] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': users, 'total': total, 'page': page, 'limit': limit}),
                'isBase64Encoded': False
            }
        
        # Получить детали пользователя
        if action == 'get_user_details':
            user_id = params.get('user_id') or body.get('user_id')
            
            cur.execute(f"SELECT * FROM {SCHEMA}users WHERE id = %s", (user_id,))
            columns = [desc[0] for desc in cur.description]
            row = cur.fetchone()
            
            if not row:
                return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Пользователь не найден'}), 'isBase64Encoded': False}
            
            user = dict(zip(columns, row))
            for key in user:
                if isinstance(user[key], datetime):
                    user[key] = user[key].isoformat()
            
            cur.execute(f"SELECT ip_address, user_agent, login_at, success FROM {SCHEMA}user_login_history WHERE user_id = %s ORDER BY login_at DESC LIMIT 50", (user_id,))
            login_history = [{'ip': r[0], 'user_agent': r[1], 'login_at': r[2].isoformat(), 'success': r[3]} for r in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': user, 'login_history': login_history}),
                'isBase64Encoded': False
            }
        
        # Блокировать пользователя
        if action == 'block_user':
            user_id = body.get('user_id')
            reason = body.get('reason', 'Нарушение правил')
            
            cur.execute(f"UPDATE {SCHEMA}users SET is_blocked = true, block_reason = %s, blocked_at = %s, blocked_by = %s WHERE id = %s",
                       (reason, datetime.now(), admin_id, user_id))
            conn.commit()
            
            log_admin_action(admin_id, 'block_user', 'user', user_id, {'reason': reason}, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        # Забанить пользователя на 24 часа
        if action == 'ban_user':
            user_id = body.get('user_id')
            reason = body.get('reason', 'Нарушение правил')
            
            # Проверяем количество банов у пользователя
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}user_bans WHERE user_id = %s", (user_id,))
            ban_count = cur.fetchone()[0] + 1
            
            # Время бана - 24 часа
            banned_until = datetime.now() + timedelta(hours=24)
            
            # Создаем запись о бане
            cur.execute(f"""
                INSERT INTO {SCHEMA}user_bans (user_id, admin_id, reason, banned_until, ban_count)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, admin_id, reason, banned_until, ban_count))
            
            # Обновляем статус пользователя
            cur.execute(f"UPDATE {SCHEMA}users SET is_banned = true WHERE id = %s", (user_id,))
            conn.commit()
            
            log_admin_action(admin_id, 'ban_user', 'user', user_id, {'reason': reason, 'ban_count': ban_count}, ip, user_agent)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'ban_count': ban_count, 'banned_until': banned_until.isoformat()}),
                'isBase64Encoded': False
            }
        
        # Разбанить пользователя
        if action == 'unban_user':
            user_id = body.get('user_id')
            
            # Деактивируем активный бан
            cur.execute(f"""
                UPDATE {SCHEMA}user_bans 
                SET is_active = false 
                WHERE user_id = %s AND is_active = true
            """, (user_id,))
            
            # Обновляем статус пользователя
            cur.execute(f"UPDATE {SCHEMA}users SET is_banned = false WHERE id = %s", (user_id,))
            conn.commit()
            
            log_admin_action(admin_id, 'unban_user', 'user', user_id, None, ip, user_agent)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        # Получить информацию о бане пользователя
        if action == 'get_ban_info':
            user_id = params.get('user_id') or body.get('user_id')
            
            cur.execute(f"""
                SELECT reason, banned_at, banned_until, ban_count
                FROM {SCHEMA}user_bans
                WHERE user_id = %s AND is_active = true
                ORDER BY banned_at DESC
                LIMIT 1
            """, (user_id,))
            
            ban_info = cur.fetchone()
            
            if ban_info:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'is_banned': True,
                        'reason': ban_info[0],
                        'banned_at': ban_info[1].isoformat(),
                        'banned_until': ban_info[2].isoformat(),
                        'ban_count': ban_info[3]
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'is_banned': False}),
                    'isBase64Encoded': False
                }
        
        # Разблокировать пользователя
        if action == 'unblock_user':
            user_id = body.get('user_id')
            
            cur.execute(f"UPDATE {SCHEMA}users SET is_blocked = false, block_reason = NULL, blocked_at = NULL, blocked_by = NULL WHERE id = %s", (user_id,))
            conn.commit()
            
            log_admin_action(admin_id, 'unblock_user', 'user', user_id, None, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        # Установить VIP статус
        if action == 'set_vip':
            user_id = body.get('user_id')
            days = body.get('days', 30)
            
            expires_at = datetime.now() + timedelta(days=days)
            cur.execute(f"UPDATE {SCHEMA}users SET is_vip = true, vip_expires_at = %s WHERE id = %s", (expires_at, user_id))
            conn.commit()
            
            log_admin_action(admin_id, 'set_vip', 'user', user_id, {'days': days}, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'expires_at': expires_at.isoformat()}), 'isBase64Encoded': False}
        
        # Убрать VIP статус
        if action == 'remove_vip':
            user_id = body.get('user_id')
            
            cur.execute(f"UPDATE {SCHEMA}users SET is_vip = false, vip_expires_at = NULL WHERE id = %s", (user_id,))
            conn.commit()
            
            log_admin_action(admin_id, 'remove_vip', 'user', user_id, None, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        # Установить верификацию
        if action == 'verify_user':
            user_id = body.get('user_id')
            
            cur.execute(f"UPDATE {SCHEMA}users SET is_verified = true WHERE id = %s", (user_id,))
            conn.commit()
            
            log_admin_action(admin_id, 'verify_user', 'user', user_id, None, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        # Убрать верификацию
        if action == 'unverify_user':
            user_id = body.get('user_id')
            
            cur.execute(f"UPDATE {SCHEMA}users SET is_verified = false WHERE id = %s", (user_id,))
            conn.commit()
            
            log_admin_action(admin_id, 'unverify_user', 'user', user_id, None, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        # Удалить пользователя из базы данных
        if action == 'delete_user':
            user_id = body.get('user_id')
            
            if not user_id:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'user_id is required'}), 'isBase64Encoded': False}
            
            # Удаляем пользователя и все связанные данные (CASCADE удалит связанные записи)
            cur.execute(f"DELETE FROM {SCHEMA}users WHERE id = %s", (user_id,))
            conn.commit()
            
            log_admin_action(admin_id, 'delete_user', 'user', user_id, None, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        # Управление разделами сайта
        if action == 'get_sections':
            cur.execute("SELECT id, section_key, section_name, is_enabled, settings, updated_at FROM site_sections ORDER BY section_key")
            sections = []
            for row in cur.fetchall():
                sections.append({
                    'id': row[0], 'key': row[1], 'name': row[2], 'enabled': row[3],
                    'settings': row[4], 'updated_at': row[5].isoformat() if row[5] else None
                })
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'sections': sections}), 'isBase64Encoded': False}
        
        if action == 'update_section':
            section_id = body.get('section_id')
            is_enabled = body.get('is_enabled')
            settings = body.get('settings')
            
            cur.execute("UPDATE site_sections SET is_enabled = %s, settings = %s, updated_at = %s, updated_by = %s WHERE id = %s",
                       (is_enabled, json.dumps(settings) if settings else None, datetime.now(), admin_id, section_id))
            conn.commit()
            
            log_admin_action(admin_id, 'update_section', 'section', section_id, {'enabled': is_enabled}, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        # Управление фильтрами
        if action == 'get_filters':
            section = params.get('section')
            cur.execute("SELECT id, section, filter_key, filter_label, filter_type, options, is_active, sort_order FROM site_filters WHERE section = %s ORDER BY sort_order, id", (section,))
            filters = []
            for row in cur.fetchall():
                filters.append({
                    'id': row[0], 'section': row[1], 'key': row[2], 'label': row[3],
                    'type': row[4], 'options': row[5], 'active': row[6], 'sort_order': row[7]
                })
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'filters': filters}), 'isBase64Encoded': False}
        
        if action == 'create_filter':
            section = body.get('section')
            filter_key = body.get('filter_key')
            filter_label = body.get('filter_label')
            filter_type = body.get('filter_type')
            options = body.get('options')
            
            cur.execute("INSERT INTO site_filters (section, filter_key, filter_label, filter_type, options) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                       (section, filter_key, filter_label, filter_type, json.dumps(options) if options else None))
            filter_id = cur.fetchone()[0]
            conn.commit()
            
            log_admin_action(admin_id, 'create_filter', 'filter', filter_id, {'section': section, 'key': filter_key}, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'id': filter_id}), 'isBase64Encoded': False}
        
        if action == 'update_filter':
            filter_id = body.get('filter_id')
            filter_label = body.get('filter_label')
            filter_type = body.get('filter_type')
            options = body.get('options')
            is_active = body.get('is_active')
            
            cur.execute("UPDATE site_filters SET filter_label = %s, filter_type = %s, options = %s, is_active = %s, updated_at = %s WHERE id = %s",
                       (filter_label, filter_type, json.dumps(options) if options else None, is_active, datetime.now(), filter_id))
            conn.commit()
            
            log_admin_action(admin_id, 'update_filter', 'filter', filter_id, None, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        # Логи действий админов
        if action == 'get_logs':
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 100))
            offset = (page - 1) * limit
            
            cur.execute(f"SELECT al.id, al.admin_id, a.email, al.action, al.target_type, al.target_id, al.details, al.ip_address, al.created_at FROM {SCHEMA}admin_logs al LEFT JOIN {SCHEMA}admins a ON al.admin_id = a.id ORDER BY al.created_at DESC LIMIT %s OFFSET %s", (limit, offset))
            logs = []
            for row in cur.fetchall():
                logs.append({
                    'id': row[0], 'admin_id': row[1], 'admin_email': row[2], 'action': row[3],
                    'target_type': row[4], 'target_id': row[5], 'details': row[6],
                    'ip': row[7], 'created_at': row[8].isoformat()
                })
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'logs': logs}), 'isBase64Encoded': False}
        
        # Отправить сообщение пользователю от админа
        if action == 'send_message':
            user_id = body.get('user_id')
            message_text = body.get('message')
            
            if not user_id or not message_text:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется user_id и message'}), 'isBase64Encoded': False}
            
            # Проверяем существование пользователя
            cur.execute(f"SELECT id FROM {SCHEMA}users WHERE id = %s", (user_id,))
            if not cur.fetchone():
                return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Пользователь не найден'}), 'isBase64Encoded': False}
            
            # Создаём или находим существующий диалог с системой
            cur.execute("SELECT id FROM conversations WHERE id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = %s) AND id IN (SELECT conversation_id FROM conversation_participants WHERE user_id IS NULL) LIMIT 1", (user_id,))
            conversation = cur.fetchone()
            
            if not conversation:
                # Создаём новый диалог
                cur.execute("INSERT INTO conversations (created_at, updated_at) VALUES (%s, %s) RETURNING id", (datetime.now(), datetime.now()))
                conversation_id = cur.fetchone()[0]
                
                # Добавляем участников (пользователь + система)
                cur.execute("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (%s, %s)", (conversation_id, user_id))
                cur.execute("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (%s, NULL)", (conversation_id,))
            else:
                conversation_id = conversation[0]
            
            # Отправляем сообщение от системы (sender_id = NULL означает системное сообщение)
            cur.execute("INSERT INTO messages (conversation_id, sender_id, message, created_at) VALUES (%s, NULL, %s, %s)", 
                       (conversation_id, message_text, datetime.now()))
            
            # Обновляем время последнего сообщения в диалоге
            cur.execute("UPDATE conversations SET updated_at = %s WHERE id = %s", (datetime.now(), conversation_id))
            
            conn.commit()
            
            log_admin_action(admin_id, 'send_message', 'user', user_id, {'message_preview': message_text[:50]}, ip, user_agent)
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'conversation_id': conversation_id}), 'isBase64Encoded': False}
        
        if action == 'verification_list':
            from psycopg2.extras import RealDictCursor
            from verification import list_verification_requests
            
            cur.close()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            filter_type = params.get('filter', 'pending')
            requests = list_verification_requests(cur, filter_type)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'requests': [dict(r) for r in requests]}, default=str),
                'isBase64Encoded': False
            }
        
        if action == 'verification_decision':
            from psycopg2.extras import RealDictCursor
            from verification import process_verification_decision
            
            cur.close()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            request_id = body.get('request_id')
            decision = body.get('decision')
            admin_comment = body.get('admin_comment', '')
            
            if not request_id or not decision:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            result = process_verification_decision(cur, conn, request_id, decision, admin_comment, admin_data['admin_id'])
            
            if 'error' in result:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            log_admin_action(admin_data['admin_id'], f'verification_{decision}', 'verification_request', request_id, {'user_id': result['user_id']}, ip, user_agent)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        # Получить все цены
        if action == 'get_prices':
            cur.execute(f"SELECT service_key, service_name, price, category, description FROM {SCHEMA}platform_prices ORDER BY category, id")
            prices = {}
            for row in cur.fetchall():
                prices[row[0]] = {
                    'name': row[1],
                    'price': row[2],
                    'category': row[3],
                    'description': row[4]
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'prices': prices}),
                'isBase64Encoded': False
            }
        
        # Обновить цены
        if action == 'update_prices':
            if not admin_data:
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется авторизация'}), 'isBase64Encoded': False}
            
            admin_id = admin_data['admin_id']
            prices = body.get('prices', {})
            
            if not prices:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется prices'}), 'isBase64Encoded': False}
            
            updated_count = 0
            for service_key, price_value in prices.items():
                cur.execute(
                    f"UPDATE {SCHEMA}platform_prices SET price = %s, updated_at = %s WHERE service_key = %s",
                    (price_value, datetime.now(), service_key)
                )
                if cur.rowcount > 0:
                    updated_count += 1
            
            conn.commit()
            
            log_admin_action(admin_id, 'update_prices', 'prices', None, {'count': updated_count}, ip, user_agent)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'updated': updated_count}),
                'isBase64Encoded': False
            }
        
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Неизвестное действие'}), 'isBase64Encoded': False}
    
    except Exception as e:
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': str(e)}), 'isBase64Encoded': False}
    
    finally:
        cur.close()
        conn.close()