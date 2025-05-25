package com.example.AI.Hotel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    @NotBlank(message = "Email là bắt buộc")
    @Email(message = "Định dạng email không phù hợp")
    private String email;

    @NotBlank(message = "OTP là bắt buộc")
    private String otp; // Mã OTP nhận từ email

    @NotBlank(message = "Mật khẩu là bắt buôc")
    @Size(min = 8, message = "Mật khẩu bắt buộc phải dài hơn 8 kí tự")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa, 1 số và 1 ký tự đặc biệt")
    private String newPassword;
}
