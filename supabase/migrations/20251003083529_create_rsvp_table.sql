/*
  # Create RSVP Table for Wedding Invitation

  1. New Tables
    - `rsvp`
      - `id` (uuid, primary key) - Unique identifier for each RSVP
      - `guest_name` (text, not null) - Name of the guest
      - `side` (text, not null) - Which side: 'bride' or 'groom'
      - `attendance_status` (text, not null) - Status: 'definitely', 'maybe', 'cannot'
      - `phone` (text, optional) - Guest phone number
      - `message` (text, optional) - Personal message from guest
      - `created_at` (timestamptz) - When the RSVP was submitted
      
  2. Security
    - Enable RLS on `rsvp` table
    - Add policy for anyone to insert their RSVP (public form)
    - Add policy for anyone to read all RSVPs (to show guest count)
    
  3. Notes
    - This is a public form, so we allow anonymous inserts
    - Read access is also public to show attendance statistics
    - In production, you may want to add admin-only policies
*/
CREATE TABLE IF NOT EXISTS rsvp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  side text NOT NULL CHECK (side IN ('bride', 'groom')),
  attendance_status text NOT NULL,
  phone text,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit RSVP"
  ON rsvp
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view RSVPs"
  ON rsvp
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- bỏ constraint cũ (nếu tồn tại)
ALTER TABLE rsvp
  DROP CONSTRAINT IF EXISTS rsvp_attendance_status_check;

-- thêm lại constraint với giá trị mới
ALTER TABLE rsvp
  ADD CONSTRAINT rsvp_attendance_status_check
  CHECK (attendance_status IN ('definitely', 'maybe', 'maybe_with_family', 'cannot'));

COMMIT;