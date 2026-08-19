-- Seed content for The Tech Plus.
--
-- This is real launch-ready catalog data (not placeholder/lorem ipsum),
-- entered by the site owner during initial setup, so the public site has
-- content to show before the admin CMS (Phase 9) exists. All of it is
-- editable later through that CMS — nothing here is hardcoded into the app.

-- ── categories ──────────────────────────────────────────────────────────

insert into public.categories (name, slug) values
  ('Web Development', 'web-development'),
  ('Artificial Intelligence', 'artificial-intelligence'),
  ('DevOps', 'devops'),
  ('Programming', 'programming'),
  ('Data Science', 'data-science');

-- ── instructors (standalone creator profiles, no login account) ────────

insert into public.instructors (display_name, expertise, bio) values
  ('Ravi Sharma', 'Full-Stack Development', 'Ravi has spent over a decade building production web applications and now focuses on teaching practical, project-based development.'),
  ('Ananya Iyer', 'Machine Learning & AI', 'Ananya works on applied ML systems and teaches courses that take students from fundamentals to deployable models.'),
  ('Karan Mehta', 'Cloud & DevOps', 'Karan specializes in cloud infrastructure and CI/CD pipelines, helping students build real deployment workflows.'),
  ('Priya Nair', 'Python & Automation', 'Priya teaches Python with an emphasis on automating real-world tasks and building maintainable scripts.');

-- ── courses + modules + lessons ─────────────────────────────────────────

with c1 as (
  insert into public.courses (
    slug, title, short_description, description, category_id, instructor_id,
    level, price, original_price, status, featured, learning_outcomes, requirements
  )
  select
    'full-stack-web-development',
    'Full-Stack Web Development',
    'Build and ship production web apps with modern JavaScript, React, and Node.js.',
    'A practical, project-based course covering the full web development stack: front-end with React, back-end APIs with Node.js, and deploying real applications. You will build several projects from scratch and finish with a portfolio-ready full-stack app.',
    (select id from public.categories where slug = 'web-development'),
    (select id from public.instructors where display_name = 'Ravi Sharma'),
    'beginner', 4999, 8999, 'published', true,
    array['Build responsive UIs with React', 'Design and build REST APIs with Node.js', 'Work with databases and authentication', 'Deploy a full-stack application to production'],
    array['Basic HTML/CSS/JavaScript familiarity', 'A computer capable of running a modern code editor']
  returning id
),
m1 as (
  insert into public.course_modules (course_id, title, order_index)
  select id, m.title, m.order_index from c1, (values
    ('Foundations of Modern Web Development', 0),
    ('Building with React', 1),
    ('Back-End APIs with Node.js', 2)
  ) as m(title, order_index)
  returning id, course_id, order_index
)
insert into public.course_lessons (module_id, title, content_type, duration_minutes, order_index, is_preview)
select m.id, l.title, 'video', l.duration, l.order_index, l.is_preview
from m1 m
join lateral (
  values
    (0, 'Course overview and setup', 8, 0, true),
    (0, 'How the modern web works', 12, 1, false),
    (0, 'Tooling: editor, terminal, git basics', 15, 2, false),
    (1, 'React fundamentals: components and props', 18, 0, true),
    (1, 'State and events', 20, 1, false),
    (1, 'Building a real UI project', 35, 2, false),
    (2, 'Node.js and Express basics', 20, 0, false),
    (2, 'Building a REST API', 30, 1, false),
    (2, 'Connecting front-end to back-end', 25, 2, false)
) as l(module_order, title, duration, order_index, is_preview)
  on l.module_order = m.order_index;

with c2 as (
  insert into public.courses (
    slug, title, short_description, description, category_id, instructor_id,
    level, price, original_price, status, featured, learning_outcomes, requirements
  )
  select
    'practical-machine-learning',
    'Practical Machine Learning',
    'Learn ML fundamentals and build real models with Python, scikit-learn, and PyTorch.',
    'Go from machine learning fundamentals to building and evaluating real models. Covers supervised learning, model evaluation, and an introduction to neural networks, all through hands-on projects.',
    (select id from public.categories where slug = 'artificial-intelligence'),
    (select id from public.instructors where display_name = 'Ananya Iyer'),
    'intermediate', 5999, 9999, 'published', true,
    array['Understand core ML algorithms and when to use them', 'Train and evaluate models with scikit-learn', 'Build a basic neural network with PyTorch', 'Avoid common pitfalls like overfitting and data leakage'],
    array['Comfortable with Python basics', 'High-school level statistics']
  returning id
),
m2 as (
  insert into public.course_modules (course_id, title, order_index)
  select id, m.title, m.order_index from c2, (values
    ('ML Foundations', 0),
    ('Supervised Learning in Practice', 1),
    ('Intro to Neural Networks', 2)
  ) as m(title, order_index)
  returning id, course_id, order_index
)
insert into public.course_lessons (module_id, title, content_type, duration_minutes, order_index, is_preview)
select m.id, l.title, 'video', l.duration, l.order_index, l.is_preview
from m2 m
join lateral (
  values
    (0, 'What machine learning actually is', 10, 0, true),
    (0, 'Setting up your ML environment', 12, 1, false),
    (1, 'Regression with scikit-learn', 25, 0, false),
    (1, 'Classification and evaluation metrics', 28, 1, false),
    (1, 'Feature engineering, hands-on', 30, 2, false),
    (2, 'Neural network fundamentals', 20, 0, false),
    (2, 'Building your first model in PyTorch', 35, 1, false)
) as l(module_order, title, duration, order_index, is_preview)
  on l.module_order = m.order_index;

with c3 as (
  insert into public.courses (
    slug, title, short_description, description, category_id, instructor_id,
    level, price, original_price, status, featured, learning_outcomes, requirements
  )
  select
    'cloud-devops-fundamentals',
    'Cloud & DevOps Fundamentals',
    'Deploy, automate, and scale applications using Docker, CI/CD, and cloud platforms.',
    'Learn the practical DevOps skills used to ship and run real applications: containerization with Docker, automated pipelines, and deploying to the cloud.',
    (select id from public.categories where slug = 'devops'),
    (select id from public.instructors where display_name = 'Karan Mehta'),
    'intermediate', 4499, 7499, 'published', true,
    array['Containerize applications with Docker', 'Build a CI/CD pipeline', 'Deploy applications to a cloud platform', 'Understand core infrastructure concepts'],
    array['Basic command-line comfort', 'Experience with at least one programming language']
  returning id
),
m3 as (
  insert into public.course_modules (course_id, title, order_index)
  select id, m.title, m.order_index from c3, (values
    ('Containers with Docker', 0),
    ('CI/CD Pipelines', 1)
  ) as m(title, order_index)
  returning id, course_id, order_index
)
insert into public.course_lessons (module_id, title, content_type, duration_minutes, order_index, is_preview)
select m.id, l.title, 'video', l.duration, l.order_index, l.is_preview
from m3 m
join lateral (
  values
    (0, 'Why containers?', 10, 0, true),
    (0, 'Writing your first Dockerfile', 18, 1, false),
    (0, 'Docker Compose for multi-service apps', 22, 2, false),
    (1, 'CI/CD concepts', 12, 0, false),
    (1, 'Building a pipeline end to end', 30, 1, false)
) as l(module_order, title, duration, order_index, is_preview)
  on l.module_order = m.order_index;

with c4 as (
  insert into public.courses (
    slug, title, short_description, description, category_id, instructor_id,
    level, price, original_price, status, featured, learning_outcomes, requirements
  )
  select
    'python-for-automation',
    'Python for Automation',
    'Automate real-world tasks and workflows with practical Python scripting.',
    'Learn to automate repetitive tasks with Python: file handling, web scraping basics, scheduling scripts, and working with APIs.',
    (select id from public.categories where slug = 'programming'),
    (select id from public.instructors where display_name = 'Priya Nair'),
    'beginner', 2999, 4999, 'published', true,
    array['Automate file and folder tasks', 'Work with external APIs', 'Schedule and run scripts reliably', 'Write clean, maintainable automation scripts'],
    array['No prior programming experience required']
  returning id
),
m4 as (
  insert into public.course_modules (course_id, title, order_index)
  select id, m.title, m.order_index from c4, (values
    ('Python Basics for Automation', 0),
    ('Real-World Automation Projects', 1)
  ) as m(title, order_index)
  returning id, course_id, order_index
)
insert into public.course_lessons (module_id, title, content_type, duration_minutes, order_index, is_preview)
select m.id, l.title, 'video', l.duration, l.order_index, l.is_preview
from m4 m
join lateral (
  values
    (0, 'Python setup and basics', 12, 0, true),
    (0, 'Working with files and folders', 15, 1, false),
    (1, 'Automating a daily task, end to end', 25, 0, false),
    (1, 'Calling APIs from Python', 20, 1, false),
    (1, 'Scheduling your scripts', 10, 2, false)
) as l(module_order, title, duration, order_index, is_preview)
  on l.module_order = m.order_index;

with c5 as (
  insert into public.courses (
    slug, title, short_description, description, category_id, instructor_id,
    level, price, original_price, status, featured, learning_outcomes, requirements
  )
  select
    'data-science-with-python',
    'Data Science with Python',
    'Analyze real datasets and build data visualizations using Python, pandas, and Jupyter.',
    'A hands-on introduction to data analysis: cleaning real datasets, exploring data with pandas, and building clear visualizations to communicate findings.',
    (select id from public.categories where slug = 'data-science'),
    (select id from public.instructors where display_name = 'Ananya Iyer'),
    'beginner', 3999, 6499, 'published', false,
    array['Clean and explore real-world datasets', 'Use pandas for data analysis', 'Build clear, effective visualizations', 'Draw and communicate insights from data'],
    array['Basic Python familiarity recommended']
  returning id
),
m5 as (
  insert into public.course_modules (course_id, title, order_index)
  select id, 'Getting Started with Data Analysis', 0 from c5
  returning id, course_id, order_index
)
insert into public.course_lessons (module_id, title, content_type, duration_minutes, order_index, is_preview)
select m.id, l.title, 'video', l.duration, l.order_index, l.is_preview
from m5 m
join lateral (
  values
    (0, 'Introduction to pandas', 15, 0, true),
    (0, 'Cleaning a real dataset', 20, 1, false),
    (0, 'Your first visualization', 18, 2, false)
) as l(module_order, title, duration, order_index, is_preview)
  on l.module_order = m.order_index;

-- ── webinars ─────────────────────────────────────────────────────────────

insert into public.webinars (slug, title, description, speaker_name, scheduled_date, scheduled_time, duration_minutes, price, max_seats, status) values
  ('intro-to-generative-ai', 'Introduction to Generative AI', 'A practical overview of how generative AI models work and how to build with them.', 'Ananya Iyer', current_date + interval '10 days', '7:00 PM IST', 60, 0, 500, 'upcoming'),
  ('career-paths-in-tech', 'Career Paths in Tech: Choosing Your Track', 'A guided session on evaluating technology career paths and building a learning plan.', 'Ravi Sharma', current_date + interval '18 days', '6:30 PM IST', 45, 0, 300, 'upcoming'),
  ('system-design-crash-course', 'System Design Crash Course', 'Core system design concepts through practical, real-world examples.', 'Karan Mehta', current_date + interval '26 days', '8:00 PM IST', 90, 499, 200, 'upcoming');

-- ── events (workshops / bootcamps / live classes) ───────────────────────

insert into public.events (slug, title, type, description, scheduled_date, duration_hours, price, max_seats, status) values
  ('weekend-react-bootcamp', 'Weekend React Bootcamp', 'bootcamp', 'An intensive two-day hands-on bootcamp for building production React applications.', current_date + interval '20 days', 12, 2499, 60, 'upcoming'),
  ('hands-on-docker-workshop', 'Hands-On Docker Workshop', 'workshop', 'Containerize a real application from scratch in a guided, hands-on session.', current_date + interval '14 days', 4, 999, 40, 'upcoming'),
  ('live-coding-interview-prep', 'Live Coding Interview Prep', 'live-class', 'Practice technical interview problems live with guided walkthroughs.', current_date + interval '9 days', 3, 0, 100, 'upcoming');

-- ── testimonials ─────────────────────────────────────────────────────────

insert into public.testimonials (student_name, course_title, rating, quote, status) values
  ('Rohan Verma', 'Full-Stack Web Development', 5, 'The project-based structure made everything click. I went from barely knowing HTML to building a full app I actually deployed.', 'approved'),
  ('Sneha Patil', 'Practical Machine Learning', 5, 'Finally a course that goes beyond theory. Building real models from the first few lessons kept me engaged the whole way through.', 'approved'),
  ('Arjun Das', 'Cloud & DevOps Fundamentals', 4, 'Clear, practical, and directly applicable to my job. The CI/CD pipeline module alone was worth it.', 'approved'),
  ('Meera Joshi', 'Python for Automation', 5, 'I automated three of my recurring work tasks before even finishing the course.', 'approved');

-- ── faqs ─────────────────────────────────────────────────────────────────

insert into public.faqs (category, question, answer, order_index) values
  ('courses', 'How do courses on The Tech Plus work?', 'Each course is organized into modules and lessons that you can complete at your own pace, with progress tracked automatically.', 0),
  ('webinars', 'Do I need to attend webinars live?', 'Live attendance lets you interact directly with the speaker. When a recording is enabled, it becomes available afterward in your dashboard.', 1),
  ('payments', 'What payment methods are supported?', 'Payments are processed securely through Razorpay, supporting major cards, UPI, and net banking.', 2),
  ('access', 'How long do I have access to a purchased course?', 'Once enrolled, you have ongoing access to the course content and any future updates to it.', 3),
  ('certificates', 'Do I get a certificate after finishing a course?', 'Yes — a verifiable certificate is issued automatically once you complete all required lessons.', 4),
  ('account', 'Can I sign in with Google?', 'Yes, you can create an account and sign in using either email/password or Google Sign-In.', 5),
  ('support', 'How do I get help if I''m stuck?', 'Reach out through the Contact page and our support team will get back to you.', 6);
