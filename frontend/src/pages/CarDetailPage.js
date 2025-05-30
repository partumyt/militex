import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CarService from '../services/car.service';
import CarCard from '../components/cars/CarCard';

const CarDetailPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [car, setCar] = useState(null);
  const [similarCars, setSimilarCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const data = await CarService.getCarById(id);
        setCar(data);

        if (data) {
          fetchSimilarCars(data);
        }

        window.scrollTo(0, 0);
      } catch (err) {
        setError('Failed to load vehicle details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const fetchSimilarCars = async (carData) => {
    try {
      const filters = {
        make: carData.make, // Same make
        vehicle_type: carData.vehicle_type, // Same vehicle type
        min_price: Math.max(0, carData.price * 0.7), // Price range: 70-130% of current car
        max_price: carData.price * 1.3,
      };

      const response = await CarService.getAllCars(filters);

      const filteredCars = response.results
        .filter(similarCar => similarCar.id !== parseInt(id))
        .slice(0, 3);

      setSimilarCars(filteredCars);
    } catch (err) {
      console.error("Error fetching similar cars:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error!</p>
          <p>{error}</p>
          <Link to="/buy" className="text-indigo-600 hover:underline mt-2 inline-block">
            &larr; {t('common.backToListing')}
          </Link>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">Vehicle Not Found</p>
          <p>The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link to="/buy" className="text-indigo-600 hover:underline mt-2 inline-block">
            &larr; {t('common.backToListing')}
          </Link>
        </div>
      </div>
    );
  }

  const images = car.images.length > 0
    ? car.images
    : [{ image: '/images/car-placeholder.jpg' }];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation breadcrumb */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm">
            <Link to="/" className="text-gray-500 hover:text-indigo-900">{t('common.home')}</Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link to="/buy" className="text-gray-500 hover:text-indigo-900">{t('common.buy')}</Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-indigo-900">{car.make} {car.model}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Car Image Gallery */}
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3">
              {/* Main Image */}
              <div className="bg-gray-200 h-72 md:h-96">
                <img
                  src={images[activeImage].image}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-2 flex space-x-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`w-20 h-16 bg-gray-200 cursor-pointer ${
                        index === activeImage ? 'ring-2 ring-indigo-900' : ''
                      }`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img
                        src={img.image}
                        alt={`${car.year} ${car.make} ${car.model} - thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Car Summary */}
            <div className="md:w-1/3 p-6">
              <h1 className="text-2xl font-bold text-indigo-900">
                {car.year} {car.make} {car.model}
              </h1>

              <div className="mt-4 text-3xl font-bold text-indigo-900">
                ${car.price.toLocaleString()}
                {car.negotiable && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({t('cars.negotiable')})
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">{t('cars.mileage')}:</span>{' '}
                  {car.mileage.toLocaleString()} km
                </p>
                <p>
                  <span className="font-medium">{t('cars.fuelType')}:</span>{' '}
                  {car.fuel_type}
                </p>
                <p>
                  <span className="font-medium">{t('cars.transmission')}:</span>{' '}
                  {car.transmission}
                </p>
                <p>
                  <span className="font-medium">{t('cars.condition')}:</span>{' '}
                  {car.condition}
                </p>
                <p>
                  <span className="font-medium">{t('cars.location')}:</span>{' '}
                  {car.city}, {car.country}
                </p>
              </div>

              {/* Contact Seller Button */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    if (car.is_imported && car.original_url) {
                      window.open(car.original_url, '_blank');
                    } else {
                      setShowContact(!showContact);
                    }
                  }}
                  className="w-full bg-indigo-900 text-white py-3 rounded-lg hover:bg-indigo-800 transition duration-200"
                >
                  {car.is_imported ? t('cars.viewOriginalAd') : (showContact ? t('cars.hideContact') : t('cars.contactSeller'))}
                </button>

                {/* Only show this section for cars listed directly on the site */}
                {!car.is_imported && showContact && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <p className="font-medium">{car.seller_username}</p>
                    {car.seller_phone && (
                      <p className="mt-1">
                        <a
                          href={`tel:${car.seller_phone}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {car.seller_phone}
                        </a>
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      {t('cars.contactDisclaimer')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Car Details Tabs */}
          <div className="p-6 border-t">
            <div className="flex border-b">
              <button className="px-4 py-2 border-b-2 border-indigo-900 text-indigo-900 font-medium">
                {t('cars.details')}
              </button>
              {/* Add more tabs as needed */}
            </div>

            <div className="mt-6">
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-indigo-900 mb-4">{t('cars.description')}</h2>
                <p className="text-gray-700 whitespace-pre-line">{car.description || t('cars.noDescription')}</p>
              </div>

              {/* Specs */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-indigo-900 mb-4">{t('cars.specifications')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-indigo-900 mb-2">{t('cars.general')}</h3>
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.carMake')}:</span>
                        <span className="font-medium">{car.make}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.carModel')}:</span>
                        <span className="font-medium">{car.model}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.year')}:</span>
                        <span className="font-medium">{car.year}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.bodyType')}:</span>
                        <span className="font-medium">{car.body_type || '-'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.condition')}:</span>
                        <span className="font-medium">{car.condition}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-indigo-900 mb-2">{t('cars.engine')}</h3>
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.fuelType')}:</span>
                        <span className="font-medium">{car.fuel_type}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.engineSize')}:</span>
                        <span className="font-medium">{car.engine_size || '-'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.enginePower')}:</span>
                        <span className="font-medium">{car.engine_power ? `${car.engine_power} HP` : '-'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.transmission')}:</span>
                        <span className="font-medium">{car.transmission}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-indigo-900 mb-2">{t('cars.other')}</h3>
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.mileage')}:</span>
                        <span className="font-medium">{car.mileage.toLocaleString()} km</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.vehicleType')}:</span>
                        <span className="font-medium">{car.vehicle_type}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.location')}:</span>
                        <span className="font-medium">{car.city}, {car.country}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">{t('cars.listedDate')}:</span>
                        <span className="font-medium">
                          {new Date(car.created_at).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Cars */}
        {similarCars.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">{t('cars.similarVehicles')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarCars.map(similarCar => (
                <Link
                  key={similarCar.id}
                  to={`/cars/${similarCar.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200">
                    {similarCar.images && similarCar.images.length > 0 ? (
                      <img
                        src={similarCar.images[0].image}
                        alt={`${similarCar.year} ${similarCar.make} ${similarCar.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-indigo-900">
                      {similarCar.year} {similarCar.make} {similarCar.model}
                    </h3>
                    <p className="text-gray-600">{similarCar.mileage.toLocaleString()} km</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xl font-bold text-indigo-900">${similarCar.price.toLocaleString()}</span>
                      <span className="text-indigo-600 hover:underline">
                        {t('common.viewDetails')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No similar cars message */}
        {similarCars.length === 0 && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">{t('cars.similarVehicles')}</h2>
            <p className="text-gray-600">{t('cars.noSimilarVehicles')}</p>
            <Link to="/buy" className="inline-block mt-4 text-indigo-600 hover:underline">
              {t('cars.browseAllVehicles')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetailPage;
