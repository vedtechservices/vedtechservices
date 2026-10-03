
ALTER TABLE offices
  ADD COLUMN latitude  numeric(10, 7),
  ADD COLUMN longitude numeric(10, 7);

-- Seed known coordinates for existing rows
UPDATE offices SET latitude = 25.8741,  longitude = 85.7817  WHERE branch_code = 'VTS-HQ';
UPDATE offices SET latitude = 25.8741,  longitude = 85.7817  WHERE branch_code = 'VTS-BR2';
