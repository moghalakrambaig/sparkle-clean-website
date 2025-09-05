package com.housecleaning.service;

import com.housecleaning.model.Booking;
import com.housecleaning.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    // ✅ Create new booking
    public Booking createBooking(Booking booking) {
        // Always default to Pending when a booking is created
        booking.setStatus(Booking.Status.Pending);

        // Generate a unique booking number if not already set
        if (booking.getBookingNumber() == null || booking.getBookingNumber().isEmpty()) {
            booking.setBookingNumber(generateBookingNumber());
        }

        return bookingRepository.save(booking);
    }

    // ✅ Get all bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ✅ Update booking status
   public Booking updateBookingStatus(Long id, String status) {
    return bookingRepository.findById(id).map(booking -> {
        try {
            // Convert to "Approved", "Pending", "Rejected"
            String normalized = status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
            Booking.Status newStatus = Booking.Status.valueOf(normalized);
            booking.setStatus(newStatus);
            return bookingRepository.save(booking);
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Invalid status: " + status);
            return null;
        }
    }).orElse(null);
}


    // ✅ Delete booking by ID
    public boolean deleteBooking(Long id) {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ✅ Get booking by bookingNumber
    public Booking getBookingByNumber(String bookingNumber) {
        return bookingRepository.findByBookingNumber(bookingNumber).orElse(null);
    }

    // --- Helper: Generate a unique booking number ---
    private String generateBookingNumber() {
        String prefix = "SPK";
        String uniquePart = Long.toHexString(System.currentTimeMillis()).toUpperCase();
        return prefix + uniquePart.substring(uniquePart.length() - 6); // last 6 chars
    }
}
