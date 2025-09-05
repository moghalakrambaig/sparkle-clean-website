import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/databaseservice';
import BookingForm from './BookingForm';
import Confirmation from './confirmation';
import type { Booking } from '../services/databaseservice';
import { SpinnerIcon } from './icons';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (details: Omit<Booking, 'id' | 'bookingNumber' | 'status'>) => {
    try {
      setError('');
      setLoading(true);
      const newBooking = await api.createBooking(details);
      setConfirmedBooking(newBooking);
    } catch (err) {
      console.error('Booking failed:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setConfirmedBooking(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-600">
        <SpinnerIcon className="w-10 h-10 mb-4" />
        <p>Submitting your booking...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      {!confirmedBooking ? (
        <BookingForm onSubmit={handleSubmit} />
      ) : (
        <Confirmation
          bookingDetails={confirmedBooking}
          smsStatus="sent" // adjust later if backend sends SMS info
          notifications={{
            customer: {
              header: 'Booking Confirmed',
              body: 'Your appointment has been saved successfully.',
              detailsSummary: {
                service: confirmedBooking.service,
                dateTime: `${confirmedBooking.date} ${confirmedBooking.time}`,
              },
            },
            representative: {
              summary: 'New booking received.',
              suggestedAction: 'Assign a cleaner and confirm availability.',
            },
          }}
          onReset={resetBooking}
        />
      )}
    </div>
  );
};

export default BookingPage;
