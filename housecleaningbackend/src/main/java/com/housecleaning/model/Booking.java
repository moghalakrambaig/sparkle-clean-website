package com.housecleaning.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bookingNumber;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String service;
    private String date;
    private String time;

    @Enumerated(EnumType.STRING)
    private Status status = Status.Pending;

    public enum Status {
    Pending,
    Approved,
    Rejected
}
}
