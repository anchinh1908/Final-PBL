package com.example.AI.Hotel.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotEmpty(message = "Email là bắt buộc và không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotEmpty(message = "Mật khẩu là bắt buộc và không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ cái in hoa, 1 số và 1 ký tự đặc biệt"
    )
    private String password;

    @NotEmpty(message = "Họ tên là bắt buộc và không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2 đến 100 ký tự")
    private String fullName;

    @Size(min = 10, max = 15, message = "Số điện thoại phải từ 10 đến 15 ký tự")
    private String phoneNumber;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate dateOfBirth;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;
}
