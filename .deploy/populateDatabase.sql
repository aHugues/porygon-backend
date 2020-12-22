INSERT INTO Location(location, is_physical)
VALUES  ('test location 1', 1),
        ('test location 2', 0),
        ('test location 3', 0);

INSERT INTO Category(label, description)
VALUES  ('test category 1', '2- this is a first test category.'),
        ('test category 2', '1- this is also a test category.');

INSERT INTO Movie
VALUES  (null, 1, 'test Movie 1', 'no comment', '', '', 2019, 42, 1, 1, 0, null, 'titre français'),
        (null, 2, 'test Movie 2', 'Comments', '', 'me', 2019, 60, 0, 0, 1, null, 'titre français'),
        (null, 1, 'test Movie 3', '', 'No one', '', 2005, 180, 0, 1, 1, null, 'titre français');

INSERT INTO Serie
VALUES  (null, 1, 'test Serie 1', 1, 'no comment', 13, 0, 0, 1, 1, 2013),
        (null, 1, 'test Serie 1', 2, 'no comment', 13, 0, 0, 1, 1, 2013),
        (null, 2, 'test Serie 2', 0, '', 4, 1, 0, 0, 2, 2019);

INSERT INTO MovieCategoryMapping
VALUES  (null, 1, 1),
        (null, 1, 2),
        (null, 2, 2);

INSERT INTO SerieCategoryMapping
VALUES  (null, 1, 1),
        (null, 1, 2),
        (null, 2, 2);


INSERT INTO User(uuid, login, password, firstName, lastName, email)
VALUES  ('abcd-efgh-1234-5647', 'user1', 'password1', 'User', 'One', 'user1@email.com'),
        ('9876-azer-tyui-1337', 'user2', 'password2', 'User', 'Two', 'user2@email.com');
