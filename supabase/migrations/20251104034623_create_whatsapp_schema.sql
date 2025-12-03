/*
  # WhatsApp Clone Schema

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text, nullable) - message text content
      - `type` (text) - message type: 'text', 'image', 'audio'
      - `media_url` (text, nullable) - URL for images/audio files
      - `audio_duration` (integer, nullable) - duration in seconds for audio
      - `is_from_lead` (boolean) - true if from lead, false if from admin
      - `read` (boolean) - message read status
      - `created_at` (timestamptz) - message timestamp
    
    - `funnel_steps`
      - `id` (uuid, primary key)
      - `step_order` (integer) - order in the funnel sequence
      - `action_type` (text) - 'send_message' or 'wait_for_reply'
      - `message_content` (text, nullable) - message to send
      - `message_type` (text, nullable) - 'text', 'image', 'audio'
      - `media_url` (text, nullable) - media URL if applicable
      - `typing_delay` (integer, nullable) - delay in milliseconds before sending
      - `active` (boolean) - whether this step is active
      - `created_at` (timestamptz)
    
    - `funnel_state`
      - `id` (uuid, primary key)
      - `current_step` (integer) - current step in funnel
      - `waiting_for_reply` (boolean) - if waiting for lead response
      - `lead_id` (text) - identifier for the lead
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public access for reading messages (simulating single conversation)
    - Public access for inserting lead messages
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  type text NOT NULL DEFAULT 'text',
  media_url text,
  audio_duration integer,
  is_from_lead boolean NOT NULL DEFAULT false,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS funnel_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_order integer NOT NULL,
  action_type text NOT NULL,
  message_content text,
  message_type text DEFAULT 'text',
  media_url text,
  typing_delay integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS funnel_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_step integer NOT NULL DEFAULT 0,
  waiting_for_reply boolean NOT NULL DEFAULT false,
  lead_id text NOT NULL DEFAULT 'default_lead',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update messages"
  ON messages FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can read funnel steps"
  ON funnel_steps FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage funnel steps"
  ON funnel_steps FOR ALL
  USING (true);

CREATE POLICY "Anyone can read funnel state"
  ON funnel_state FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update funnel state"
  ON funnel_state FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert funnel state"
  ON funnel_state FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS funnel_steps_order_idx ON funnel_steps(step_order);

INSERT INTO funnel_state (current_step, waiting_for_reply, lead_id) 
VALUES (0, false, 'default_lead')
ON CONFLICT DO NOTHING;