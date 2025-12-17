-- =====================================================
-- DATOS INICIALES - FLAVIA DERMOBEAUTY
-- Contenido en ESPAÑOL según especificación del proyecto
-- =====================================================

-- =====================================================
-- CATEGORÍAS
-- =====================================================

INSERT INTO categories (name, slug, description, type) VALUES
    ('Tratamientos Faciales', 'tratamientos-faciales', 'Tratamientos especializados para el cuidado y rejuvenecimiento del rostro', 'SERVICE'),
    ('Tratamientos Corporales', 'tratamientos-corporales', 'Tratamientos para el cuidado y embellecimiento del cuerpo', 'SERVICE'),
    ('Cuidado Facial', 'cuidado-facial', 'Productos especializados para el cuidado de la piel del rostro', 'PRODUCT'),
    ('Cuidado Corporal', 'cuidado-corporal', 'Productos para el cuidado integral de la piel del cuerpo', 'PRODUCT');

-- =====================================================
-- SERVICIOS DE EJEMPLO
-- =====================================================

INSERT INTO services (name, slug, description, short_description, duration_minutes, price, category_id, is_featured, is_active) VALUES
    (
        'Limpieza Facial Profunda',
        'limpieza-facial-profunda',
        'Tratamiento completo de limpieza facial que incluye: exfoliación, extracción de impurezas, aplicación de máscara purificante y hidratación profunda. Ideal para todo tipo de piel.',
        'Limpieza profunda con extracción y máscara purificante',
        60,
        12000.00,
        (SELECT id FROM categories WHERE slug = 'tratamientos-faciales'),
        TRUE,
        TRUE
    ),
    (
        'Peeling Químico',
        'peeling-quimico',
        'Renovación celular mediante la aplicación de ácidos que eliminan las capas superficiales de la piel, reduciendo manchas, líneas de expresión y mejorando la textura cutánea.',
        'Renovación celular para reducir manchas y líneas',
        45,
        18000.00,
        (SELECT id FROM categories WHERE slug = 'tratamientos-faciales'),
        TRUE,
        TRUE
    ),
    (
        'Hidratación Facial Intensiva',
        'hidratacion-facial-intensiva',
        'Tratamiento de hidratación profunda con ácido hialurónico y vitaminas. Aporta luminosidad, suavidad y elasticidad a la piel. Incluye mascarilla y masaje facial relajante.',
        'Hidratación profunda con ácido hialurónico',
        50,
        14500.00,
        (SELECT id FROM categories WHERE slug = 'tratamientos-faciales'),
        TRUE,
        TRUE
    ),
    (
        'Drenaje Linfático Corporal',
        'drenaje-linfatico-corporal',
        'Masaje especializado que estimula el sistema linfático para eliminar toxinas, reducir retención de líquidos y mejorar la circulación. Ideal para piernas cansadas y celulitis.',
        'Masaje para eliminar toxinas y reducir retención',
        75,
        16000.00,
        (SELECT id FROM categories WHERE slug = 'tratamientos-corporales'),
        FALSE,
        TRUE
    );

-- =====================================================
-- PRODUCTOS DE EJEMPLO
-- =====================================================

INSERT INTO products (name, slug, description, short_description, price, stock, category_id, is_featured, is_offer, is_trending, is_active) VALUES
    (
        'Serum Vitamina C - 30ml',
        'serum-vitamina-c-30ml',
        'Serum concentrado con vitamina C pura que aporta luminosidad, reduce manchas y protege contra el daño ambiental. Fórmula ligera de rápida absorción. Apto para todo tipo de piel.',
        'Ilumina y reduce manchas con vitamina C pura',
        8500.00,
        25,
        (SELECT id FROM categories WHERE slug = 'cuidado-facial'),
        TRUE,
        FALSE,
        TRUE,
        TRUE
    ),
    (
        'Crema Hidratante Ácido Hialurónico - 50ml',
        'crema-hidratante-acido-hialuronico-50ml',
        'Crema facial con triple acción: hidrata, rellena y suaviza. Contiene ácido hialurónico de diferentes pesos moleculares para una hidratación profunda y duradera.',
        'Hidratación profunda con ácido hialurónico',
        9800.00,
        30,
        (SELECT id FROM categories WHERE slug = 'cuidado-facial'),
        TRUE,
        FALSE,
        TRUE,
        TRUE
    ),
    (
        'Protector Solar FPS 50+ - 50ml',
        'protector-solar-fps-50-50ml',
        'Protección solar de amplio espectro UVA/UVB. Fórmula oil-free, no comedogénica. Resistente al agua. Textura ligera que no deja residuo blanco. Ideal para uso diario.',
        'Protección solar FPS 50+ sin residuo blanco',
        7200.00,
        40,
        (SELECT id FROM categories WHERE slug = 'cuidado-facial'),
        TRUE,
        TRUE,
        FALSE,
        TRUE
    ),
    (
        'Exfoliante Corporal Enzimático - 200ml',
        'exfoliante-corporal-enzimatico-200ml',
        'Exfoliante suave con enzimas de papaya y partículas de bambú. Elimina células muertas sin agredir la piel. Deja la piel suave, renovada y preparada para absorber tratamientos.',
        'Exfoliación suave con enzimas naturales',
        6500.00,
        20,
        (SELECT id FROM categories WHERE slug = 'cuidado-corporal'),
        FALSE,
        FALSE,
        TRUE,
        TRUE
    ),
    (
        'Aceite Corporal Nutritivo - 100ml',
        'aceite-corporal-nutritivo-100ml',
        'Blend de aceites naturales (rosa mosqueta, jojoba, vitamina E) que nutre profundamente la piel. Mejora la elasticidad y previene estrías. Ideal para masajes.',
        'Nutrición profunda con aceites naturales',
        8900.00,
        15,
        (SELECT id FROM categories WHERE slug = 'cuidado-corporal'),
        FALSE,
        TRUE,
        FALSE,
        TRUE
    );

-- =====================================================
-- CONFIGURACIÓN DEL SITIO
-- =====================================================

INSERT INTO app_config (config_key, config_value, description) VALUES
    -- Información del sitio
    ('site.name', 'Flavia Dermobeauty', 'Nombre del sitio web'),
    ('site.tagline', 'Belleza y Salud Dermatológica', 'Eslogan del sitio'),

    -- Contacto
    ('contact.email', 'contacto@flaviadermobeauty.com', 'Email de contacto'),
    ('contact.whatsapp', '+54 9 11 1234-5678', 'Número de WhatsApp'),
    ('contact.address', 'Av. Santa Fe 1234, CABA, Argentina', 'Dirección física del consultorio'),
    ('contact.phone', '+54 11 4567-8901', 'Teléfono fijo'),

    -- Costos
    ('delivery.fixed_cost', '1500.00', 'Costo fijo de envío a domicilio en ARS'),

    -- Textos del sitio (Hero)
    ('hero.title', 'Belleza que cuida tu piel', 'Título principal del hero'),
    ('hero.subtitle', 'Tratamientos dermatológicos profesionales y productos de alta calidad para realzar tu belleza natural', 'Subtítulo del hero'),
    ('hero.cta_text', 'Conocé nuestros tratamientos', 'Texto del botón CTA del hero'),

    -- Bio de Flavia
    ('bio.title', '¿Quién es Flavia?', 'Título de la sección bio'),
    ('bio.text', 'Soy Flavia, profesional en dermocosmiatría con más de 10 años de experiencia en el cuidado de la piel. Mi objetivo es ayudarte a sentirte bien con vos misma, brindándote tratamientos personalizados y productos de la más alta calidad. En mi consultorio, cada cliente es único y recibe atención especializada según sus necesidades.', 'Biografía de Flavia'),
    ('bio.credentials', 'Dermocosmiatrista matriculada • Especialista en tratamientos faciales • Certificada en peelings químicos', 'Credenciales profesionales'),

    -- Redes sociales
    ('social.instagram', 'https://instagram.com/flaviadermobeauty', 'URL de Instagram'),
    ('social.facebook', 'https://facebook.com/flaviadermobeauty', 'URL de Facebook'),
    ('social.tiktok', '', 'URL de TikTok (opcional)'),

    -- Horarios
    ('schedule.info', 'Lunes a Viernes: 9:00 - 19:00hs | Sábados: 9:00 - 13:00hs', 'Información de horarios de atención'),

    -- Políticas
    ('policy.cancellation', 'Las cancelaciones deben realizarse con al menos 24hs de anticipación. Caso contrario se cobrará el 50% del servicio.', 'Política de cancelación'),
    ('policy.returns', 'Aceptamos devoluciones de productos sin abrir dentro de los 15 días de la compra.', 'Política de devoluciones');

-- =====================================================
-- FIN DE DATOS INICIALES
-- =====================================================
