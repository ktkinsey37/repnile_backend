-- both test users have the password "password"
\connect repnile;

INSERT INTO animals (name, species, weight, sex, birth_date, price, coloration_pattern, primary_color, secondary_color, for_sale, img_url)
VALUES ('lizard',
        'gecko',
        45,
        'male',
        '01-01-22',
        2.34,
        'spotted',
        'red',
        'yellow',
        TRUE,
        'google'),
        ('lizard2',
        'gecko',
        33,
        'female',
        '02-01-22',
        244.34,
        'stripe',
        'green',
        'blue',
        FALSE,
        'google');
       