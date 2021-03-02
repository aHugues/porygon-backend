INSERT INTO "Location" (location, is_physical)
VALUES  ('test location 1', true),
        ('test location 2', false),
        ('test location 3', false);

INSERT INTO "Category" (label, description)
VALUES  ('test category 1', '2- this is a first test category.'),
        ('test category 2', '1- this is also a test category.');

INSERT INTO "Movie"
VALUES  (DEFAULT, 1, 'test Movie 1', 'no comment', '', '', 2019, 42, true, true, false, null, 'titre français'),
        (DEFAULT, 2, 'test Movie 2', 'Comments', '', 'me', 2019, 60, false, false, true, null, 'titre français'),
        (DEFAULT, 1, 'test Movie 3', '', 'No one', '', 2005, 180, false, true, true, null, 'titre français');

INSERT INTO "Serie"
VALUES  (DEFAULT, 1, 'test Serie 1', 1, 'no comment', 13, false, false, true, 1, 2013),
        (DEFAULT, 1, 'test Serie 1', 2, 'no comment', 13, false, false, true, 1, 2013),
        (DEFAULT, 2, 'test Serie 2', 0, '', 4, true, false, false, 2, 2019);

INSERT INTO "MovieCategoryMapping"
VALUES  (DEFAULT, 1, 1),
        (DEFAULT, 1, 2),
        (DEFAULT, 2, 2);

INSERT INTO "SerieCategoryMapping"
VALUES  (DEFAULT, 1, 1),
        (DEFAULT, 1, 2),
        (DEFAULT, 2, 2);


INSERT INTO "User" (uuid, login, password, "firstName", "lastName", email)
VALUES  ('abcd-efgh-1234-5647', 'user1', 'password1', 'User', 'One', 'user1@email.com'),
        ('9876-azer-tyui-1337', 'user2', 'password2', 'User', 'Two', 'user2@email.com');
