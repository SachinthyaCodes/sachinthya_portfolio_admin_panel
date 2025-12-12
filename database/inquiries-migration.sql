-- Create inquiries table for contact form submissions
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster querying
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX idx_inquiries_is_read ON public.inquiries(is_read);

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy for inserting (allow anyone to submit contact form)
-- Using permissive policy that allows both anon and authenticated
CREATE POLICY "Allow all insert" ON public.inquiries
    FOR INSERT
    WITH CHECK (true);

-- Policy for selecting (allow only service_role - admin API)
CREATE POLICY "Allow service role select" ON public.inquiries
    FOR SELECT
    TO service_role
    USING (true);

-- Policy for updating (allow only service_role - admin API)
CREATE POLICY "Allow service role update" ON public.inquiries
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy for deleting (allow only service_role - admin API)
CREATE POLICY "Allow service role delete" ON public.inquiries
    FOR DELETE
    TO service_role
    USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER update_inquiries_updated_at_trigger
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_inquiries_updated_at();
