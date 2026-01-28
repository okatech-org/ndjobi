-- Add reference_number column to signalements
ALTER TABLE public.signalements 
ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_signalements_reference_number 
ON public.signalements(reference_number);

-- Create function to generate unique reference number
CREATE OR REPLACE FUNCTION public.generate_signalement_reference()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
  new_reference TEXT;
  attempts INT := 0;
BEGIN
  year_part := to_char(NOW(), 'YYYY');
  
  LOOP
    -- Generate random 6-character alphanumeric
    random_part := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    new_reference := 'NDJ-' || year_part || '-' || random_part;
    
    -- Check if exists
    IF NOT EXISTS (SELECT 1 FROM public.signalements WHERE reference_number = new_reference) THEN
      NEW.reference_number := new_reference;
      EXIT;
    END IF;
    
    attempts := attempts + 1;
    IF attempts > 10 THEN
      -- Fallback with timestamp
      NEW.reference_number := 'NDJ-' || year_part || '-' || to_char(NOW(), 'MMDDHHMI');
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate reference on insert
DROP TRIGGER IF EXISTS generate_reference_trigger ON public.signalements;
CREATE TRIGGER generate_reference_trigger
  BEFORE INSERT ON public.signalements
  FOR EACH ROW
  WHEN (NEW.reference_number IS NULL)
  EXECUTE FUNCTION public.generate_signalement_reference();

-- Allow anyone to lookup signalement status by reference (for anonymous tracking)
CREATE POLICY "Anyone can lookup signalement by reference"
ON public.signalements FOR SELECT
USING (reference_number IS NOT NULL);