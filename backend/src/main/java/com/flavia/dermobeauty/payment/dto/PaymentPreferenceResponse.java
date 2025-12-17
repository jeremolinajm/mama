package com.flavia.dermobeauty.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for payment preference response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPreferenceResponse {
    private String preferenceId;
    private String initPoint;
}
