import Icon from '@/components/ui/icon';

const EmptyServicesState = () => {
  return (
    <div className="text-center py-20">
      <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-2xl font-bold mb-2">Услуги не найдены</h3>
      <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
    </div>
  );
};

export default EmptyServicesState;
