import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const MyAds = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
              Создать объявление
            </h1>

            <Card className="rounded-3xl border-2 shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="gender">Тип объявления</Label>
                    <select 
                      id="gender"
                      className="w-full mt-2 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="men">Мужчина</option>
                      <option value="women">Девушка</option>
                    </select>
                  </div>

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

export default MyAds;
