-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'joel@joelburton.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'joel@joelburton.com',
        TRUE);

INSERT INTO companies (handle,
                       name,
                       num_employees,
                       description,
                       logo_url)
VALUES ('bauer-gallagher', 'Bauer-Gallagher', 862,
        'Difficult ready trip question produce produce someone.', NULL),
       ('edwards-lee-reese', 'Edwards, Lee and Reese', 744,
        'To much recent it reality coach decision Mr. Dog language evidence minute either deep situation pattern. Other cold bad loss surface real show.',
        '/logos/logo2.png'),
       ('hall-davis', 'Hall-Davis', 749,
        'Adult go economic off into. Suddenly happy according only common. Father plant wrong free traditional.',
        '/logos/logo2.png')

INSERT INTO jobs (title, salary, equity, company_handle)
VALUES ('Conservator, furniture', 110000, 0, 'watson-davis'),
       ('Information officer', 200000, 0, 'hall-mills'),
       ('Consulting civil engineer', 60000, 0, 'sellers-bryant'),
       