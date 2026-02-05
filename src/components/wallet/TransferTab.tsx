import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TransferTabProps {
  hasFinancialPassword: boolean;
  showSetPassword: boolean;
  setShowSetPassword: (value: boolean) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  handleSetPassword: () => void;
  transferRecipientId: string;
  setTransferRecipientId: (value: string) => void;
  transferAmount: string;
  setTransferAmount: (value: string) => void;
  financialPassword: string;
  setFinancialPassword: (value: string) => void;
  handleTransfer: () => void;
  loading: boolean;
}

const TransferTab = ({
  hasFinancialPassword,
  showSetPassword,
  setShowSetPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleSetPassword,
  transferRecipientId,
  setTransferRecipientId,
  transferAmount,
  setTransferAmount,
  financialPassword,
  setFinancialPassword,
  handleTransfer,
  loading
}: TransferTabProps) => {
  if (!hasFinancialPassword) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Icon name="Lock" className="w-6 h-6 text-amber-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Финансовый пароль не установлен
                </h3>
                <p className="text-sm text-amber-800 mb-4">
                  Для защиты ваших средств необходимо установить специальный финансовый пароль. 
                  Он будет запрашиваться при каждом переводе.
                </p>
                <Button onClick={() => setShowSetPassword(true)} className="bg-amber-600 hover:bg-amber-700">
                  Установить пароль
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showSetPassword && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="newPassword">Новый финансовый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Минимум 4 символа"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleSetPassword} disabled={loading} className="flex-1">
                  Установить
                </Button>
                <Button onClick={() => setShowSetPassword(false)} variant="outline">
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="recipientId" className="text-base font-medium mb-3 block">
          ID получателя
        </Label>
        <Input
          id="recipientId"
          type="number"
          placeholder="Введите ID пользователя"
          value={transferRecipientId}
          onChange={(e) => setTransferRecipientId(e.target.value)}
          className="text-lg h-12"
        />
      </div>

      <div>
        <Label htmlFor="transferAmount" className="text-base font-medium mb-3 block">
          Сумма перевода
        </Label>
        <Input
          id="transferAmount"
          type="number"
          placeholder="Введите сумму"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          className="text-lg h-12"
        />
      </div>

      <div>
        <Label htmlFor="financialPassword" className="text-base font-medium mb-3 block">
          Финансовый пароль
        </Label>
        <Input
          id="financialPassword"
          type="password"
          placeholder="Введите финансовый пароль"
          value={financialPassword}
          onChange={(e) => setFinancialPassword(e.target.value)}
          className="text-lg h-12"
        />
      </div>

      <Button 
        onClick={handleTransfer} 
        disabled={loading}
        className="w-full h-12 text-base"
      >
        <Icon name="Send" className="mr-2 h-5 w-5" />
        Выполнить перевод
      </Button>
    </div>
  );
};

export default TransferTab;
