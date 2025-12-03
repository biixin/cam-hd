/*
  # Add free time block tracking

  1. Changes
    - Add `free_time_blocked_at` column to `user_sessions` table
      - Stores the timestamp when the free time was blocked
      - Once set, prevents user from accessing free video again
      - Only reset if user makes a payment

  2. Notes
    - NULL means user hasn't been blocked yet
    - Non-NULL means user was blocked and needs to pay
    - Field is cleared when `has_paid_free_time` becomes true
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'free_time_blocked_at'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN free_time_blocked_at timestamptz;
  END IF;
END $$;
