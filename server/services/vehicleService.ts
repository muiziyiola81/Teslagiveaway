import { getSupabaseAdmin, getSupabase } from '../db/supabase';
import { DatabaseVehicle } from '../types';

// Authoritative default inventory for database seeding and backup
export const SEED_VEHICLES: Omit<DatabaseVehicle, 'created_at' | 'updated_at'>[] = [
  {
    id: 'veh-ms-plaid-2026',
    vin: '5YJSA1E28TF982104',
    model: 'Model S',
    year: 2026,
    trim: 'Plaid Tri-Motor AWD',
    powertrain: 'Tri-Motor All-Wheel Drive (1,020 hp)',
    range_miles: 359,
    zero_to_sixty_sec: 1.99,
    top_speed_mph: 200,
    exterior_color: 'Deep Blue Metallic',
    interior_color: 'All Black Carbon Fiber Décor',
    wheels: '21" Arachnid Wheels',
    price_usd: 0,
    delivery_fee_usd: 1200,
    documentation_fee_usd: 190,
    is_free_promotional_vehicle: true,
    availability_status: 'in_stock',
    image_url: './images/model-s-primary.jpg'
  },
  {
    id: 'veh-m3-perf-2026',
    vin: '5YJ3E1EB8TF441920',
    model: 'Model 3',
    year: 2026,
    trim: 'Performance AWD',
    powertrain: 'Dual Motor Performance AWD (510 hp)',
    range_miles: 303,
    zero_to_sixty_sec: 2.9,
    top_speed_mph: 163,
    exterior_color: 'Pearl White Multi-Coat',
    interior_color: 'Black and White Sport Interior',
    wheels: '20" Warp Wheels',
    price_usd: 0,
    delivery_fee_usd: 1200,
    documentation_fee_usd: 190,
    is_free_promotional_vehicle: true,
    availability_status: 'in_stock',
    image_url: './images/model-3-primary.jpg'
  },
  {
    id: 'veh-my-lr-2026',
    vin: '7SAYGDEE8TF330198',
    model: 'Model Y',
    year: 2026,
    trim: 'Long Range AWD',
    powertrain: 'Dual Motor All-Wheel Drive (384 hp)',
    range_miles: 311,
    zero_to_sixty_sec: 4.8,
    top_speed_mph: 135,
    exterior_color: 'Solid Black',
    interior_color: 'All Black Premium Interior',
    wheels: '20" Induction Wheels',
    price_usd: 0,
    delivery_fee_usd: 1200,
    documentation_fee_usd: 190,
    is_free_promotional_vehicle: true,
    availability_status: 'in_stock',
    image_url: './images/model-y-primary.jpg'
  },
  {
    id: 'veh-mx-plaid-2026',
    vin: '5YJXCBE28TF719033',
    model: 'Model X',
    year: 2026,
    trim: 'Plaid Tri-Motor AWD',
    powertrain: 'Tri-Motor All-Wheel Drive (1,020 hp)',
    range_miles: 326,
    zero_to_sixty_sec: 2.5,
    top_speed_mph: 163,
    exterior_color: 'Ultra Red Metallic',
    interior_color: 'Cream Premium Interior with Walnut Décor',
    wheels: '22" Turbine Wheels',
    price_usd: 0,
    delivery_fee_usd: 1200,
    documentation_fee_usd: 190,
    is_free_promotional_vehicle: true,
    availability_status: 'allocated',
    image_url: './images/model-x-primary.jpg'
  },
  {
    id: 'veh-ct-cb-2026',
    vin: '7G2CE6ED8TF104882',
    model: 'Cybertruck',
    year: 2026,
    trim: 'Cyberbeast Tri-Motor AWD',
    powertrain: 'Tri-Motor All-Wheel Drive (845 hp)',
    range_miles: 320,
    zero_to_sixty_sec: 2.6,
    top_speed_mph: 130,
    exterior_color: 'Stainless Steel Armor',
    interior_color: 'Tactical Grey with Ceramic Finish',
    wheels: '20" Cyber Wheels with 35" All-Terrain Tires',
    price_usd: 0,
    delivery_fee_usd: 1200,
    documentation_fee_usd: 190,
    is_free_promotional_vehicle: true,
    availability_status: 'in_stock',
    image_url: './images/cybertruck-primary.jpg'
  }
];

export async function getVehiclesList(): Promise<DatabaseVehicle[]> {
  const supabase = getSupabase() || getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('model', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as DatabaseVehicle[];
      }
    } catch {
      // Fallback cleanly
    }
  }

  // Fallback to verified seed catalog
  return SEED_VEHICLES.map(v => ({
    ...v,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-13T00:00:00Z'
  }));
}

export async function getVehicleById(id: string): Promise<DatabaseVehicle | null> {
  const supabase = getSupabase() || getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return data as DatabaseVehicle;
      }
    } catch {
      // Fallback
    }
  }

  const found = SEED_VEHICLES.find(v => v.id === id);
  if (found) {
    return {
      ...found,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-13T00:00:00Z'
    };
  }
  return null;
}

export async function seedVehiclesIfEmpty(): Promise<{ seeded: number; message: string }> {
  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    return { seeded: 0, message: 'Supabase admin client unavailable' };
  }

  const { data: existing } = await adminClient.from('vehicles').select('id');
  if (existing && existing.length > 0) {
    return { seeded: 0, message: 'Vehicles table already contains records.' };
  }

  const toInsert = SEED_VEHICLES.map(v => ({
    ...v,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const { error } = await adminClient.from('vehicles').insert(toInsert);
  if (error) {
    throw new Error(`Failed to seed vehicles: ${error.message}`);
  }

  return { seeded: toInsert.length, message: `Successfully seeded ${toInsert.length} vehicles.` };
}
