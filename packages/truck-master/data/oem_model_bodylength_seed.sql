-- Seed data for OEM Model Body Length mapping
-- Typical tyre counts and body lengths for common truck models

BEGIN;

INSERT INTO oem_model_bodylength (maker, model_name, typical_tyre_count, typical_body_length_ft, typical_body_types, min_length_ft, max_length_ft)
VALUES
-- Tata Motors
('TATA', '407', ARRAY[6], ARRAY[14, 16, 18], ARRAY['OPEN', 'CONTAINER'], 14, 18),
('TATA', '709', ARRAY[6], ARRAY[16, 18], ARRAY['OPEN', 'CONTAINER'], 16, 18),
('TATA', '1613', ARRAY[10], ARRAY[20, 22], ARRAY['OPEN', 'CONTAINER'], 20, 22),
('TATA', '2516', ARRAY[10, 12], ARRAY[22, 24], ARRAY['OPEN', 'CONTAINER', 'FLATBED'], 22, 24),
('TATA', '3118', ARRAY[12, 14], ARRAY[24, 26], ARRAY['OPEN', 'CONTAINER', 'FLATBED'], 24, 26),
('TATA', '4923', ARRAY[14, 16], ARRAY[26, 28], ARRAY['CONTAINER', 'FLATBED'], 26, 28),

-- Ashok Leyland
('ASHOK_LEYLAND', 'DOST', ARRAY[6], ARRAY[14, 16], ARRAY['OPEN', 'CONTAINER'], 14, 16),
('ASHOK_LEYLAND', 'DOST_Plus', ARRAY[6], ARRAY[16, 18], ARRAY['OPEN', 'CONTAINER'], 16, 18),
('ASHOK_LEYLAND', 'Boss', ARRAY[10], ARRAY[20, 22], ARRAY['OPEN', 'CONTAINER'], 20, 22),
('ASHOK_LEYLAND', 'Partner', ARRAY[10, 12], ARRAY[22, 24], ARRAY['OPEN', 'CONTAINER', 'FLATBED'], 22, 24),
('ASHOK_LEYLAND', 'U-Truck', ARRAY[12, 14], ARRAY[24, 26], ARRAY['OPEN', 'CONTAINER', 'FLATBED'], 24, 26),
('ASHOK_LEYLAND', 'AVTR', ARRAY[14, 16], ARRAY[26, 28], ARRAY['CONTAINER', 'FLATBED'], 26, 28),

-- Mahindra
('MAHINDRA', 'Bolero_Pik_Up', ARRAY[6], ARRAY[12, 14], ARRAY['OPEN'], 12, 14),
('MAHINDRA', 'Bolero_Maxx_Pik_Up', ARRAY[6], ARRAY[14, 16], ARRAY['OPEN', 'CONTAINER'], 14, 16),
('MAHINDRA', 'Furio', ARRAY[10, 12], ARRAY[20, 22], ARRAY['OPEN', 'CONTAINER'], 20, 22),
('MAHINDRA', 'Blazo', ARRAY[12, 14, 16], ARRAY[24, 26, 28], ARRAY['OPEN', 'CONTAINER', 'FLATBED'], 24, 28),

-- Eicher
('EICHER', 'Pro_1049', ARRAY[6], ARRAY[14, 16], ARRAY['OPEN', 'CONTAINER'], 14, 16),
('EICHER', 'Pro_3015', ARRAY[10, 12], ARRAY[20, 22], ARRAY['OPEN', 'CONTAINER'], 20, 22),
('EICHER', 'Pro_6025', ARRAY[12, 14], ARRAY[24, 26], ARRAY['OPEN', 'CONTAINER', 'FLATBED'], 24, 26),

-- BharatBenz
('BHARATBENZ', '1214C', ARRAY[10], ARRAY[20, 22], ARRAY['OPEN', 'CONTAINER'], 20, 22),
('BHARATBENZ', '1617R', ARRAY[12, 14], ARRAY[24, 26], ARRAY['OPEN', 'CONTAINER', 'FLATBED'], 24, 26),
('BHARATBENZ', '2523R', ARRAY[14, 16], ARRAY[26, 28], ARRAY['CONTAINER', 'FLATBED'], 26, 28),
('BHARATBENZ', '3128R', ARRAY[16, 18], ARRAY[28, 30], ARRAY['CONTAINER', 'FLATBED'], 28, 30),

-- Volvo
('VOLVO', 'FM', ARRAY[12, 14, 16], ARRAY[24, 26, 28], ARRAY['CONTAINER', 'FLATBED'], 24, 28),
('VOLVO', 'FH', ARRAY[14, 16, 18], ARRAY[28, 30, 32], ARRAY['CONTAINER', 'FLATBED', 'LOWBED'], 28, 32),

-- Trailer configurations
('GENERIC', 'TRAILER_20FT', ARRAY[4, 6], ARRAY[20], ARRAY['TRAILER', 'CONTAINER'], 19, 21),
('GENERIC', 'TRAILER_40FT', ARRAY[6, 8], ARRAY[40], ARRAY['TRAILER', 'CONTAINER'], 39, 41),
('GENERIC', 'TRAILER_45FT', ARRAY[8, 10], ARRAY[45], ARRAY['TRAILER', 'CONTAINER'], 44, 46),

-- Lowbed/Special vehicles
('GENERIC', 'LOWBED_12T', ARRAY[6, 10], ARRAY[18, 22], ARRAY['LOWBED'], 18, 22),
('GENERIC', 'LOWBED_25T', ARRAY[12, 14], ARRAY[24, 28], ARRAY['LOWBED'], 24, 28),
('GENERIC', 'LOWBED_40T', ARRAY[16, 18], ARRAY[30, 32], ARRAY['LOWBED'], 30, 32)

ON CONFLICT (maker, model_name) DO UPDATE SET
    typical_tyre_count = EXCLUDED.typical_tyre_count,
    typical_body_length_ft = EXCLUDED.typical_body_length_ft,
    typical_body_types = EXCLUDED.typical_body_types,
    min_length_ft = EXCLUDED.min_length_ft,
    max_length_ft = EXCLUDED.max_length_ft,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;

