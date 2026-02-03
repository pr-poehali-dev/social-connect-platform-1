import os
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor

def list_verification_requests(cur, filter_type='pending'):
    schema = os.environ['MAIN_DB_SCHEMA']
    
    if filter_type == 'pending':
        status_filter = "WHERE vr.status = 'pending'"
    else:
        status_filter = ""
    
    cur.execute(f"""
        SELECT 
            vr.id,
            vr.user_id,
            CONCAT(u.first_name, ' ', u.last_name) as user_name,
            u.email as user_email,
            vr.status,
            vr.selfie_photo_url,
            vr.document_photo_url,
            vr.comment,
            vr.admin_comment,
            vr.created_at,
            vr.updated_at,
            vr.reviewed_at,
            vr.reviewed_by
        FROM {schema}.verification_requests vr
        JOIN {schema}.users u ON u.id = vr.user_id
        {status_filter}
        ORDER BY 
            CASE vr.status 
                WHEN 'pending' THEN 1
                WHEN 'approved' THEN 2
                WHEN 'rejected' THEN 3
            END,
            vr.created_at DESC
    """)
    
    return cur.fetchall()

def process_verification_decision(cur, conn, request_id, decision, admin_comment, admin_id):
    schema = os.environ['MAIN_DB_SCHEMA']
    
    cur.execute(f"""
        SELECT user_id, selfie_photo_url, document_photo_url, status
        FROM {schema}.verification_requests
        WHERE id = %s
    """, (request_id,))
    
    request_data = cur.fetchone()
    if not request_data:
        return {'error': 'Request not found'}
    
    if request_data['status'] != 'pending':
        return {'error': 'Request already processed'}
    
    user_id = request_data['user_id']
    new_status = 'approved' if decision == 'approve' else 'rejected'
    
    cur.execute(f"""
        UPDATE {schema}.verification_requests
        SET status = %s,
            admin_comment = %s,
            reviewed_by = %s,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = %s
    """, (new_status, admin_comment, admin_id, request_id))
    
    if decision == 'approve':
        cur.execute(f"""
            UPDATE {schema}.users
            SET is_verified = true,
                verified_at = NOW()
            WHERE id = %s
        """, (user_id,))
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        try:
            selfie_key = request_data['selfie_photo_url'].split('/bucket/')[-1]
            document_key = request_data['document_photo_url'].split('/bucket/')[-1]
            
            s3.delete_object(Bucket='files', Key=selfie_key)
            s3.delete_object(Bucket='files', Key=document_key)
        except Exception as e:
            print(f"Failed to delete photos: {e}")
    
    conn.commit()
    
    return {
        'success': True,
        'message': f'Request {new_status}',
        'user_id': user_id
    }
