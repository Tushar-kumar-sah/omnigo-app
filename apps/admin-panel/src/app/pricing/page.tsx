'use client';
import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getPricingRules, updatePricingRules, supabase } from '@omnigo/api';

type VehiclePricingTier = { category: string; baseFare: number; baseKmIncluded: number; perKmRate: number; heavyDutySurcharge: number; };
export default function PricingEnginePage() {
  const [tiers, setTiers] = useState<VehiclePricingTier[]>([]);
  const [rules, setRules] = useState({ nightChargeMultiplier: 1.25, waitingChargePerMin: 5, emergencySosCharge: 300, highwayTollPolicy: '', platformCommissionPercent: 10, gstRate: 18, activeSurgeZones: [] as any[] });
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const rulesData = await getPricingRules();
        if (rulesData) {
          setRules({
            ...rulesData,
            activeSurgeZones: rulesData.activeSurgeZones || []
          });
        }
        const { data: vtData, error } = await supabase.from('vehicle_types').select('*');
        if (vtData && !error) {
          setTiers(vtData.map(vt => ({
            category: vt.name,
            baseFare: Number(vt.base_price),
            baseKmIncluded: Number(vt.base_km_included),
            perKmRate: Number(vt.price_per_km),
            heavyDutySurcharge: Number(vt.heavy_duty_surcharge)
          })));
        }
      } catch (err) {
        console.error('Error loading pricing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fare Simulator State
  const [simCategory, setSimCategory] = useState('');
  const [simDistance, setSimDistance] = useState(12); // km
  const [simIsNight, setSimIsNight] = useState(false);
  const [simWaitingMins, setSimWaitingMins] = useState(0);
  const [simIsSOS, setSimIsSOS] = useState(false);
  const [simSurgeMultiplier, setSimSurgeMultiplier] = useState(1.0);

  const handleUpdateTier = (index: number, field: keyof VehiclePricingTier, value: number) => {
    const updated = [...tiers];
    (updated[index] as any)[field] = value;
    setTiers(updated);
  };

  const handleSave = async () => {
    try {
      await updatePricingRules(rules);
      setSaveNotice('Fare matrices and dynamic surcharge rules deployed to active dispatchers.');
      setTimeout(() => setSaveNotice(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate simulated fare
  const activeTier = tiers.find(t => t.category === simCategory) || { baseKmIncluded: 0, perKmRate: 0, baseFare: 0, heavyDutySurcharge: 0 };
  const extraKm = Math.max(0, simDistance - (activeTier.baseKmIncluded || 0));
  const distanceFare = extraKm * (activeTier.perKmRate || 0);
  const waitingFare = Math.max(0, simWaitingMins - 5) * rules.waitingChargePerMin;
  const sosCharge = simIsSOS ? rules.emergencySosCharge : 0;
  const rawSubtotal = (activeTier.baseFare || 0) + distanceFare + (activeTier.heavyDutySurcharge || 0) + waitingFare + sosCharge;
  const nightMultiplier = simIsNight ? rules.nightChargeMultiplier : 1.0;
  const totalCustomerFare = Math.round(rawSubtotal * nightMultiplier * simSurgeMultiplier);
  const omniGoCommission = Math.round(totalCustomerFare * (rules.platformCommissionPercent / 100));
  const gstOnCommission = Math.round(omniGoCommission * (rules.gstRate / 100));
  const partnerNetEarning = totalCustomerFare - omniGoCommission;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Dynamic Pricing & Rate Matrix
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Base tariff configurations, distance thresholds, surge policies, and real-time simulator
          </p>
        </div>

        <button
          onClick={handleSave}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'var(--accent-green)',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.82rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          Deploy Pricing Matrix
        </button>
      </div>

      {saveNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--accent-green-subtle)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '8px',
          color: 'var(--accent-green)',
          fontSize: '0.86rem',
          fontWeight: 600,
        }}>
          ✓ {saveNotice}
        </div>
      )}

      {/* Grid: Vehicle Base Matrix (Left) + Platform Surcharges & Zone Rules (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '1.5rem' }}>
        
        {/* Left: Vehicle Class Base Fare Matrix */}
        <GlassCard style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.75rem' }}>
            Vehicle Category Base Tariff
          </span>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Base (₹)</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Km Incl.</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Per Km (₹)</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Surcharge (₹)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Loading...
                    </td>
                  </tr>
                ) : (
                  tiers.map((tier, idx) => (
                    <tr key={tier.category} style={{ borderBottom: '1px solid var(--glass-border-subtle)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#F8FAFC' }}>{tier.category}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <input
                          type="number"
                          value={tier.baseFare}
                          onChange={(e) => handleUpdateTier(idx, 'baseFare', Number(e.target.value))}
                          style={{ width: '65px', padding: '3px 6px' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <input
                          type="number"
                          value={tier.baseKmIncluded}
                          onChange={(e) => handleUpdateTier(idx, 'baseKmIncluded', Number(e.target.value))}
                          style={{ width: '50px', padding: '3px 6px' }}
                        /> km
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <input
                          type="number"
                          value={tier.perKmRate}
                          onChange={(e) => handleUpdateTier(idx, 'perKmRate', Number(e.target.value))}
                          style={{ width: '55px', padding: '3px 6px', color: 'var(--accent-green)', fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <input
                          type="number"
                          value={tier.heavyDutySurcharge}
                          onChange={(e) => handleUpdateTier(idx, 'heavyDutySurcharge', Number(e.target.value))}
                          style={{ width: '55px', padding: '3px 6px' }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Right: Surcharges & Zone Rules */}
        <GlassCard style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Platform Commission & Global Surcharges
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC' }}>Night Surge Multiplier (23:00 - 06:00)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Automated nocturnal surcharge</div>
              </div>
              <input
                type="number"
                step="0.05"
                value={rules.nightChargeMultiplier}
                onChange={(e) => setRules({ ...rules, nightChargeMultiplier: Number(e.target.value) })}
                style={{ width: '65px', padding: '3px 6px', textAlign: 'right', color: 'var(--accent-cyan)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC' }}>Waiting Tariff / min (after 5m grace)</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>On-site loading delay compensation</div>
              </div>
              <input
                type="number"
                value={rules.waitingChargePerMin}
                onChange={(e) => setRules({ ...rules, waitingChargePerMin: Number(e.target.value) })}
                style={{ width: '65px', padding: '3px 6px', textAlign: 'right' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC' }}>Emergency SOS Priority Fee</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Immediate route clearing & dispatch</div>
              </div>
              <input
                type="number"
                value={rules.emergencySosCharge}
                onChange={(e) => setRules({ ...rules, emergencySosCharge: Number(e.target.value) })}
                style={{ width: '65px', padding: '3px 6px', textAlign: 'right', color: 'var(--accent-red)', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC' }}>OmniGo Platform Commission Rate</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Platform take (+18% GST)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  value={rules.platformCommissionPercent}
                  onChange={(e) => setRules({ ...rules, platformCommissionPercent: Number(e.target.value) })}
                  style={{ width: '50px', padding: '3px 6px', textAlign: 'right', color: 'var(--accent-green)', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>
          </div>

          {/* Active Geofenced Surge Zones */}
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>
              Active Dynamic Surge Geofences
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.76rem' }}>
              {rules.activeSurgeZones.map((z, i) => (
                <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.04)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#E2E8F0' }}>{z.zoneName} ({z.reason})</span>
                  <strong style={{ color: 'var(--accent-yellow)' }}>{z.multiplier}x Multiplier</strong>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ─── LIVE FARE CALCULATOR SIMULATOR ─── */}
      <GlassCard style={{ padding: '1.5rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '1rem' }}>
          Interactive Fare Simulation Tool
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Vehicle Class</label>
            <select
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              {tiers.map(t => <option key={t.category} value={t.category}>{t.category}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Distance: <strong style={{ color: '#F8FAFC' }}>{simDistance} km</strong>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={simDistance}
              onChange={(e) => setSimDistance(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Waiting Time: <strong style={{ color: '#F8FAFC' }}>{simWaitingMins} mins</strong>
            </label>
            <input
              type="range"
              min="0"
              max="60"
              value={simWaitingMins}
              onChange={(e) => setSimWaitingMins(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', paddingTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={simIsNight} onChange={(e) => setSimIsNight(e.target.checked)} />
              Night Rate (1.25x)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={simIsSOS} onChange={(e) => setSimIsSOS(e.target.checked)} />
              SOS Rush (+₹300)
            </label>
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer Total Fare</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)', fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>₹{totalCustomerFare}.00</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Platform Cut (10%)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-red)', fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>₹{omniGoCommission}.00</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GST on Fee (18%)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>₹{gstOnCommission}.00</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Partner Net Take-Home</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)', fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>₹{partnerNetEarning}.00</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
