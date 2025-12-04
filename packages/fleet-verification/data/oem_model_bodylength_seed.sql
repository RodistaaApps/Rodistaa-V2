-- Seed data for OEM Model Body Length Mapping
-- Top models from major OEMs

INSERT INTO oem_model_bodylength (oem_name, model_code, model_name, typical_body_length_ft, typical_wheelbase_mm, typical_ulw_kg, typical_gvw_kg, typical_tyre_count, typical_axle_count, body_type_category)
VALUES
-- Tata Models
('TATA', '407', 'Tata 407 Pickup', 17.5, 3000, 2500, 7500, 6, 2, 'OPEN_BODY'),
('TATA', '709', 'Tata 709', 18.0, 3200, 2800, 8000, 6, 2, 'OPEN_BODY'),
('TATA', '1613', 'Tata LPT 1613', 22.0, 4500, 5500, 16000, 10, 3, 'OPEN_BODY'),
('TATA', '2518', 'Tata LPT 2518', 26.0, 5500, 7500, 25000, 12, 4, 'OPEN_BODY'),
('TATA', '3523', 'Tata LPT 3523', 30.0, 6000, 9500, 35000, 14, 5, 'OPEN_BODY'),
('TATA', '4023', 'Tata LPT 4023', 40.0, 6500, 12000, 40000, 16, 5, 'OPEN_BODY'),

-- Ashok Leyland Models
('ASHOK_LEYLAND', 'DOST', 'Ashok Leyland Dost', 18.0, 3100, 2600, 7500, 6, 2, 'OPEN_BODY'),
('ASHOK_LEYLAND', 'DOST_PLUS', 'Ashok Leyland Dost Plus', 22.0, 4500, 5800, 16000, 10, 3, 'OPEN_BODY'),
('ASHOK_LEYLAND', '2516', 'Ashok Leyland U-Truck 2516', 26.0, 5400, 7200, 25000, 12, 4, 'OPEN_BODY'),
('ASHOK_LEYLAND', '3523', 'Ashok Leyland U-Truck 3523', 30.0, 6100, 9800, 35000, 14, 5, 'OPEN_BODY'),
('ASHOK_LEYLAND', '4023', 'Ashok Leyland U-Truck 4023', 40.0, 6600, 12500, 40000, 16, 5, 'OPEN_BODY'),

-- BharatBenz Models
('BHARATBENZ', '1214', 'BharatBenz 1214', 22.0, 4400, 5600, 16000, 10, 3, 'OPEN_BODY'),
('BHARATBENZ', '1617', 'BharatBenz 1617', 26.0, 5500, 7400, 25000, 12, 4, 'OPEN_BODY'),
('BHARATBENZ', '2523', 'BharatBenz 2523', 30.0, 6000, 9600, 35000, 14, 5, 'OPEN_BODY'),
('BHARATBENZ', '3123', 'BharatBenz 3123', 38.0, 6400, 11800, 40000, 16, 5, 'OPEN_BODY'),
('BHARATBENZ', '4023', 'BharatBenz 4023', 40.0, 6500, 12200, 50000, 18, 6, 'OPEN_BODY'),

-- Eicher Models
('EICHER', 'PRO_1049', 'Eicher Pro 1049', 18.0, 3000, 2400, 7500, 6, 2, 'OPEN_BODY'),
('EICHER', 'PRO_3015', 'Eicher Pro 3015', 26.0, 5400, 7000, 25000, 12, 4, 'OPEN_BODY'),
('EICHER', 'PRO_6023', 'Eicher Pro 6023', 30.0, 6000, 9200, 35000, 14, 5, 'OPEN_BODY'),

-- Mahindra Models
('MAHINDRA', 'BOLERO_PICKUP', 'Mahindra Bolero Pickup', 17.5, 2900, 2300, 7000, 6, 2, 'OPEN_BODY'),
('MAHINDRA', 'BOLERO_MAXI', 'Mahindra Bolero Maxi Truck', 18.5, 3200, 2700, 8000, 6, 2, 'OPEN_BODY'),

-- Volvo Models
('VOLVO', 'FM_440', 'Volvo FM 440', 26.0, 5600, 7800, 25000, 12, 4, 'CONTAINER'),
('VOLVO', 'FH_540', 'Volvo FH 540', 40.0, 6500, 12000, 50000, 18, 6, 'CONTAINER'),

-- Trailer Models (generic)
('TATA', 'TRAILER_CONTAINER', 'Tata Container Trailer', 40.0, NULL, 8000, 30000, 16, NULL, 'CONTAINER'),
('ASHOK_LEYLAND', 'TRAILER_FLATBED', 'Ashok Leyland Flatbed Trailer', 40.0, NULL, 7500, 25000, 18, NULL, 'FLATBED'),
('ASHOK_LEYLAND', 'TRAILER_LOWBED', 'Ashok Leyland Lowbed Trailer', 45.0, NULL, 10000, 50000, 20, NULL, 'LOWBED'),
('BHARATBENZ', 'TRAILER_SKELETAL', 'BharatBenz Skeletal Trailer', 40.0, NULL, 8200, 32000, 16, NULL, 'SKELETAL')

ON CONFLICT (oem_name, model_code) DO NOTHING;

