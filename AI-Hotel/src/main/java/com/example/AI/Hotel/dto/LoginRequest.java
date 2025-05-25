package com.example.AI.Hotel.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Email là bắt buộc ")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotEmpty(message = "Mật khẩu là bắt buộc và không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;
}
