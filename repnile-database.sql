--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

-- Started on 2022-03-23 19:22:37

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3363 (class 0 OID 42663)
-- Dependencies: 213
-- Data for Name: animals; Type: TABLE DATA; Schema: public; Owner: ktkin
--

INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (4, 'Spotty', 'Gecko', 246.00, '01/22/17', 'Male', 'Spotted', 'Blue', 'Yellow', 12.99, true, '1648083588752spottedblueyellow.jpg');
INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (5, 'Leppy', 'Leopard Gecko', 334.00, '4/13/1990', 'female', 'Leopard', 'Orange', 'White', 75.99, false, '1648083645552leopardorangewhite.jpg');
INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (6, 'Cinder', 'Gecko', 432.00, '06-15-20', 'Male', 'Splotched', 'Black', 'Orange', 54.88, true, '1648083783228image0(1).jpeg');
INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (7, 'Tina', 'Desert Gecko', 333.00, '01-22-2020', 'Female', 'Spotted', 'Tan', 'Black', 177.77, true, '1648083850662image1(1).jpeg');
INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (8, 'Diablo', 'Treecko', 123.00, '8/10/22', 'Male', 'Spotted', 'Black', 'Orange', 8888.99, true, '1648083933210image2(1).jpeg');
INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (9, 'Licky', 'Gecko', 432.00, '01/01/01', 'Male', 'Desert', 'Tan', 'Black', 999.99, true, '1648083978844image3(1).jpeg');
INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (3, 'Dotty', 'Gecko', 787.88, '09/09/09', 'Male', 'Spotted', 'Yellow', 'Blue', 9.00, true, '1647873702776112-200x300.jpg');
INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (2, 'Popp', 'gecko', 455.44, '22/22/22', 'male', 'Trueblue', 'Green', 'Purple', 333.00, true, '1647873690187image0.jpeg');
INSERT INTO animals (id, name, species, weight, birth_date, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url) VALUES (1, 'Croc', 'crocodile', 2313.00, '21/21/21', 'male', 'Solid', 'green', 'green', 23.00, true, '1647873676101image2.jpeg');


--
-- TOC entry 3364 (class 0 OID 42682)
-- Dependencies: 214
-- Data for Name: animal_photos; Type: TABLE DATA; Schema: public; Owner: ktkin
--



--
-- TOC entry 3369 (class 0 OID 42726)
-- Dependencies: 219
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: ktkin
--

INSERT INTO events (id, title, date, description) VALUES (1, 'Big Event!', 'Sometime next month', 'This is a sweet event to do some stuff');


--
-- TOC entry 3360 (class 0 OID 42641)
-- Dependencies: 210
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: ktkin
--



--
-- TOC entry 3365 (class 0 OID 42695)
-- Dependencies: 215
-- Data for Name: item_photos; Type: TABLE DATA; Schema: public; Owner: ktkin
--



--
-- TOC entry 3367 (class 0 OID 42715)
-- Dependencies: 217
-- Data for Name: message_threads; Type: TABLE DATA; Schema: public; Owner: ktkin
--



--
-- TOC entry 3371 (class 0 OID 42735)
-- Dependencies: 221
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: ktkin
--



--
-- TOC entry 3366 (class 0 OID 42708)
-- Dependencies: 216
-- Data for Name: parent_children; Type: TABLE DATA; Schema: public; Owner: ktkin
--

INSERT INTO public.parent_children (parent_id, child_id, u_key) VALUES (1, 3, '1, 3');
INSERT INTO public.parent_children (parent_id, child_id, u_key) VALUES (1, 2, '1, 2');
INSERT INTO public.parent_children (parent_id, child_id, u_key) VALUES (2, 3, '2, 3');


--
-- TOC entry 3361 (class 0 OID 42653)
-- Dependencies: 211
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ktkin
--

INSERT INTO users (username, password, email, is_admin) VALUES ('test', '$2b$13$GVihcIDD2GLaD1eS9FxXDuEUeWFSS13xAEpDEkUWcJYApjWvEKCvy', 'email@email.com', true);


--
-- TOC entry 3377 (class 0 OID 0)
-- Dependencies: 212
-- Name: animals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ktkin
--

SELECT pg_catalog.setval('public.animals_id_seq', 9, true);


--
-- TOC entry 3378 (class 0 OID 0)
-- Dependencies: 218
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ktkin
--

SELECT pg_catalog.setval('public.events_id_seq', 1, true);


--
-- TOC entry 3379 (class 0 OID 0)
-- Dependencies: 209
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ktkin
--

SELECT pg_catalog.setval('public.items_id_seq', 1, false);


--
-- TOC entry 3380 (class 0 OID 0)
-- Dependencies: 220
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ktkin
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


-- Completed on 2022-03-23 19:22:37

--
-- PostgreSQL database dump complete
--

