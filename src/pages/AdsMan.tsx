import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const AdsMan = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6 gap-2"
              onClick={() => window.history.back()}
            >
              <Icon name="ArrowLeft" size={20} />
              Назад
            </Button>

            <Card className="rounded-3xl border-2 shadow-xl">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                  Создать объявление (Мужчины)
                </h1>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">Имя</Label>
                    <Input 
                      id="name" 
                      placeholder="Введите ваше имя"
                      className="rounded-xl mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Возраст</Label>
                    <Input 
                      id="age" 
                      type="number"
                      placeholder="Ваш возраст"
                      className="rounded-xl mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Город</Label>
                    <Input 
                      id="location" 
                      placeholder="Введите ваш город"
                      className="rounded-xl mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Расскажите о себе..."
                      className="rounded-xl mt-2 min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="photo">Фото</Label>
                    <Input 
                      id="photo" 
                      type="file"
                      accept="image/*"
                      className="rounded-xl mt-2"
                    />
                  </div>

                  <Button className="w-full rounded-2xl py-6 text-lg">
                    <Icon name="Send" size={20} className="mr-2" />
                    Опубликовать объявление
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdsMan;
