/*
  # Create user sessions and chat tables

  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key)
      - `session_id` (text, unique) - Browser session identifier
      - `nickname` (text) - User nickname
      - `has_paid_free_time` (boolean) - Whether user paid for continuing after free time
      - `has_paid_private_room` (boolean) - Whether user paid for private room
      - `video_progress` (integer) - Video progress in seconds
      - `is_in_private_room` (boolean) - Current private room status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (text) - References user session
      - `username` (text) - Message sender username
      - `text` (text) - Message content
      - `color` (text) - Username color
      - `is_system` (boolean) - System message flag
      - `is_tip` (boolean) - Tip message flag
      - `tip_amount` (numeric) - Tip amount if applicable
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  nickname text,
  has_paid_free_time boolean DEFAULT false,
  has_paid_private_room boolean DEFAULT false,
  video_progress integer DEFAULT 0,
  is_in_private_room boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  username text NOT NULL,
  text text NOT NULL,
  color text NOT NULL,
  is_system boolean DEFAULT false,
  is_tip boolean DEFAULT false,
  tip_amount numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read user sessions"
  ON user_sessions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert user sessions"
  ON user_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update user sessions"
  ON user_sessions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read chat messages"
  ON chat_messages
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);