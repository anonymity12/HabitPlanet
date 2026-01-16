-- Seed Data for HabitPlanet Database
-- This file contains initial data for testing and development

-- Insert a default user (for development/testing)
INSERT INTO users (id, name, coins, pet_level, pet_exp, pet_name, equipped_skin)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Traveler', 150, 1, 20, 'Gloopy', 'default')
ON CONFLICT (id) DO NOTHING;

-- Insert default inventory items for the user
INSERT INTO user_inventory (user_id, item_id)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'default')
ON CONFLICT (user_id, item_id) DO NOTHING;

-- Insert sample habits
INSERT INTO habits (id, user_id, title, description, type, frequency, target_count, completed_count, streak, last_check_in_date, is_completed_today, created_at)
VALUES 
    (
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0000-000000000001',
        'Morning Water',
        'Drink a glass of water after waking up',
        'Life',
        'Daily',
        1,
        0,
        3,
        NULL,
        false,
        CURRENT_TIMESTAMP - INTERVAL '3 hours'
    ),
    (
        '00000000-0000-0000-0000-000000000012',
        '00000000-0000-0000-0000-000000000001',
        'Code Study',
        'Learn React for 1 hour',
        'Study',
        'Daily',
        1,
        0,
        12,
        NULL,
        false,
        CURRENT_TIMESTAMP - INTERVAL '6 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sub-tasks for the Code Study habit
INSERT INTO sub_tasks (habit_id, title, is_completed)
VALUES 
    ('00000000-0000-0000-0000-000000000012', 'Read Docs', false),
    ('00000000-0000-0000-0000-000000000012', 'Write Code', false)
ON CONFLICT DO NOTHING;
