import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import SEO from '../components/Common/SEO';
import ImageMagnifier from '../components/Common/ImageMagnifier';
import ImageLightbox from '../components/Common/ImageLightbox';
import styles from './Shop.module.scss';
import tShirtImage from '../assets/shop/t-shirt.png';
import merchImage from '../assets/shop/merch.png';

interface ShopItem {
  id: string;
  name: string;
  nameKey: string;
  image: string;
  price: number;
  inStock: boolean;
}

const Shop = () => {
  const { t } = useTranslation();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [enlarged, setEnlarged] = useState<ShopItem | null>(null);

  const shopItems: ShopItem[] = [
    {
      id: 't-shirt',
      name: 'Expat T-Shirt',
      nameKey: 'shop.tShirt',
      image: tShirtImage,
      price: 29.99,
      inStock: true,
    },
    {
      id: 'merch',
      name: 'Expat Merch',
      nameKey: 'shop.merch',
      image: merchImage,
      price: 49.99,
      inStock: false,
    },
  ];

  return (
    <>
      <SEO
        title={`${t('navigation.shop')} - ${t('app.title')}`}
        description="Shop Expat App merchandise - T-shirts, hoodies, and more. Show your support for the app that connects expats with opportunities in Finland."
        keywords="expat merchandise, expat shop, t-shirt, hoodie, expat app merchandise"
        url={currentUrl}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: `${t('navigation.shop')} - ${t('app.title')}`,
          description: 'Shop Expat App merchandise',
          url: currentUrl,
        }}
      />
      <div className={styles.shopContainer}>
        <h1 className={styles.title}>{t('navigation.shop')}</h1>
        <p className={styles.subtitle}>{t('shop.subtitle')}</p>
        
        <div className={styles.itemsGrid}>
          {shopItems.map((item) => (
            <Card key={item.id} className={styles.itemCard}>
              <div className={styles.imageContainer}>
                <ImageMagnifier
                  src={item.image}
                  alt={t(item.nameKey)}
                  imageClassName={styles.itemImage}
                  onClick={() => setEnlarged(item)}
                  clickLabel={t('shop.enlarge', 'Enlarge photo')}
                />
                {!item.inStock && (
                  <div className={styles.outOfStockOverlay}>
                    <Badge value={t('shop.outOfStock')} severity="danger" />
                  </div>
                )}
              </div>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{t(item.nameKey)}</h3>
                <div className={styles.itemPrice}>
                  <span className={styles.priceSymbol}>€</span>
                  <span className={styles.priceAmount}>{item.price.toFixed(2)}</span>
                </div>
                {item.inStock && (
                  <Badge value={t('shop.inStock')} severity="success" className={styles.stockBadge} />
                )}
                <button type="button" className={styles.enlarge} onClick={() => setEnlarged(item)}>
                  <i className="pi pi-search-plus" aria-hidden="true" />
                  {t('shop.enlarge', 'Enlarge photo')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {enlarged && <ImageLightbox src={enlarged.image} alt={t(enlarged.nameKey)} onClose={() => setEnlarged(null)} />}
    </>
  );
};

export default Shop;

