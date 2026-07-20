-- Enums for Roles
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'PROFESSOR', 'ALUMNO');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    avatar_url TEXT,
    professor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Only for ALUMNO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding Anamnesis (For Alumnos)
CREATE TABLE anamnesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    training_experience VARCHAR(255),
    other_activities TEXT,
    injuries_conditions TEXT,
    weekly_frequency INTEGER,
    muscle_interests TEXT,
    exercise_preferences TEXT,
    training_goal TEXT,
    sees_nutritionist BOOLEAN,
    current_weight DECIMAL(5,2),
    height DECIMAL(5,2),
    age INTEGER,
    split_preference VARCHAR(50),
    additional_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exercise Library (Dynamic)
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Routines
CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Routine Weeks
CREATE TABLE routine_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL, -- 1 to 4
    UNIQUE(routine_id, week_number)
);

-- Routine Days
CREATE TABLE routine_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES routine_weeks(id) ON DELETE CASCADE,
    day_name VARCHAR(50) NOT NULL, -- e.g., "Lunes", "Día 1 - Tren Superior"
    student_comments TEXT -- Filled by student after the session
);

-- Exercises in a Day
CREATE TABLE daily_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID REFERENCES routine_days(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE RESTRICT,
    order_index INTEGER NOT NULL,
    target_sets INTEGER,
    target_reps VARCHAR(50),
    target_weight DECIMAL(6,2),
    
    -- Feedback
    prof_perception VARCHAR(255),
    student_rpe INTEGER, -- Rating of Perceived Exertion (1-10)
    actual_weight DECIMAL(6,2),
    actual_reps VARCHAR(50)
);
