INSERT INTO Location(location, is_physical)
VALUES  ('test location 1', 1),
        ('test location 2', 0);

INSERT INTO Category(label, description)
VALUES  ('test category 1', '2- this is a first test category.'),
        ('test category 2', '1- this is also a test category.');

INSERT INTO Movie
VALUES  (null, 1, 'test Movie 1', 'no comment', '', '', 2019, 42, 1, 1, 0, 2),
        (null, 2, 'test Movie 2', 'Comments', '', 'me', 2017, 60, 0, 0, 1, 1),
        (null, 1, 'test Movie 3', '', 'No one', '', 2005, 180, 0, 1, 1, 1)