import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const FIN_PASS_URL = 'https://functions.poehali.dev/26ccbe26-abcf-43ed-a5b8-36f92e5efa86';

const SettingsFinancialPassword = () => {
  const { toast } = useToast();
  const [hasFinPass, setHasFinPass] = useState(false);
  const [finPassMode, setFinPassMode] = useState<'idle' | 'set' | 'change' | 'reset'>('idle');
  const [finPassCurrent, setFinPassCurrent] = useState('');
  const [finPassNew, setFinPassNew] = useState('');
  const [finPassConfirm, setFinPassConfirm] = useState('');
  const [finPassLoading, setFinPassLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    fetch(FIN_PASS_URL, { headers: { 'X-User-Id': userId } })
      .then(r => r.json())
      .then(d => setHasFinPass(!!d.has_password))
      .catch(() => {});
  }, []);

  const resetFinPassForm = () => {
    setFinPassMode('idle');
    setFinPassCurrent('');
    setFinPassNew('');
    setFinPassConfirm('');
  };

  const handleFinPassSubmit = async () => {
    if (finPassNew.length < 4) {
      toast({ title: 'Минимум 4 символа', variant: 'destructive' });
      return;
    }
    if (finPassNew !== finPassConfirm) {
      toast({ title: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    setFinPassLoading(true);

    if (finPassMode === 'change') {
      const verifyRes = await fetch(FIN_PASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
        body: JSON.stringify({ action: 'verify', password: finPassCurrent }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.valid) {
        toast({ title: 'Неверный текущий пароль', variant: 'destructive' });
        setFinPassLoading(false);
        return;
      }
    }

    const res = await fetch(FIN_PASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
      body: JSON.stringify({ action: 'set', password: finPassNew }),
    });
    const data = await res.json();
    setFinPassLoading(false);
    if (data.success) {
      setHasFinPass(true);
      toast({ title: finPassMode === 'set' ? 'Финансовый пароль установлен' : 'Пароль изменён' });
      resetFinPassForm();
    } else {
      toast({ title: data.error || 'Ошибка', variant: 'destructive' });
    }
  };

  return (
    <div className="pt-4 border-t space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="ShieldCheck" size={18} className="text-emerald-600" />
        <Label className="text-base font-medium">Финансовый пароль</Label>
        {hasFinPass && (
          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Установлен</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Защищает переводы токенов. Требуется при каждой отправке.
      </p>

      {finPassMode === 'idle' && (
        <div className="flex gap-2">
          {!hasFinPass ? (
            <Button size="sm" variant="outline" className="gap-1 border-emerald-400 text-emerald-700 hover:bg-emerald-50" onClick={() => setFinPassMode('set')}>
              <Icon name="Plus" size={14} />
              Установить
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setFinPassMode('change')}>
                <Icon name="Pencil" size={14} />
                Изменить
              </Button>
              <Button size="sm" variant="outline" className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50" onClick={() => setFinPassMode('reset')}>
                <Icon name="RotateCcw" size={14} />
                Сбросить
              </Button>
            </>
          )}
        </div>
      )}

      {(finPassMode === 'set' || finPassMode === 'change' || finPassMode === 'reset') && (
        <div className="space-y-3 p-4 bg-muted/40 rounded-xl border">
          <p className="text-sm font-medium">
            {finPassMode === 'set' && 'Новый финансовый пароль'}
            {finPassMode === 'change' && 'Изменение пароля'}
            {finPassMode === 'reset' && 'Сброс пароля (новый пароль)'}
          </p>
          {finPassMode === 'change' && (
            <Input
              type="password"
              placeholder="Текущий пароль"
              value={finPassCurrent}
              onChange={e => setFinPassCurrent(e.target.value)}
              className="h-11"
            />
          )}
          <Input
            type="password"
            placeholder="Новый пароль (мин. 4 символа)"
            value={finPassNew}
            onChange={e => setFinPassNew(e.target.value)}
            className="h-11"
          />
          <Input
            type="password"
            placeholder="Повторите пароль"
            value={finPassConfirm}
            onChange={e => setFinPassConfirm(e.target.value)}
            className="h-11"
          />
          <div className="flex gap-2">
            <Button onClick={handleFinPassSubmit} disabled={finPassLoading} className="flex-1 h-11">
              {finPassLoading ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : <Icon name="Check" size={16} className="mr-2" />}
              Сохранить
            </Button>
            <Button variant="ghost" onClick={resetFinPassForm} className="h-11">
              Отмена
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsFinancialPassword;
