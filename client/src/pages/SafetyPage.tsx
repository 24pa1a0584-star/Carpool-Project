import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ShieldCheck,
  EyeOff,
  PhoneCall,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const SafetyPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
      <div>
        <Badge variant="turquoise" size="sm" className="mb-1.5 font-bold">
          Trust & Safety Center
        </Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy">
          Travel Safely with RouteBloom
        </h1>
        <p className="text-xs sm:text-sm text-brand-navy/60 mt-1">
          Community guidelines, privacy practices, and recommendations for secure carpooling in India.
        </p>
      </div>

      {/* 4 Core Safety Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-violet/10 text-brand-violet flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-brand-navy">
            1. Privacy & Address Masking
          </h3>
          <p className="text-xs text-brand-navy/70 leading-relaxed">
            Exact residential addresses are never displayed publicly. RouteBloom emphasizes public landmarks
            (e.g. Benz Circle, Bus Station, College Gates) for pickup and drop-off to protect all commuters' privacy.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-brand-navy">
            2. Contact Details Protection
          </h3>
          <p className="text-xs text-brand-navy/70 leading-relaxed">
            Driver and passenger contact phone numbers remain concealed from public visitors and are shared
            only after a seat reservation has been officially confirmed by both parties.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-pink/10 text-[#BE185D] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-brand-navy">
            3. Ladies-Only Travel Option
          </h3>
          <p className="text-xs text-brand-navy/70 leading-relaxed">
            Female drivers have the option to publish "Ladies Only" rides where only female passengers can reserve seats.
            These rides are clearly marked with an unmistakable pink shield badge.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-lime/30 text-[#5B7808] flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-brand-navy">
            4. Mutual Verified Reviews
          </h3>
          <p className="text-xs text-brand-navy/70 leading-relaxed">
            After every completed trip, both driver and passenger submit feedback.
            Ratings reflect authentic road experience, punctuality, and mutual respect.
          </p>
        </Card>
      </div>

      {/* Community Code of Conduct */}
      <section id="conduct" className="space-y-4">
        <h2 className="font-heading text-2xl font-bold text-brand-navy flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-violet" /> Community Code of Conduct
        </h2>

        <Card className="p-6 space-y-4 text-xs leading-relaxed text-brand-navy/80">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" />
              <p>
                <strong className="text-brand-navy">Punctuality:</strong> Arrive at the designated pickup landmark at least 5 minutes before scheduled departure. Inform your carpool partners immediately if delayed by traffic.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" />
              <p>
                <strong className="text-brand-navy">Non-Commercial Travel:</strong> RouteBloom is built for genuine cost-sharing among personal travelers. Drivers must not treat carpooling as a commercial taxi service or solicit arbitrary surcharges.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" />
              <p>
                <strong className="text-brand-navy">Safe Driving & Fastag:</strong> Drivers must obey highway speed limits, wear seatbelts, avoid phone distractions, and ensure vehicle documentation (Insurance and PUC) is current.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" />
              <p>
                <strong className="text-brand-navy">Zero Tolerance for Harassment:</strong> Any inappropriate behaviour, harassment, or discrimination will result in immediate permanent account suspension and escalation.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Safety Disclaimer */}
      <div className="p-5 bg-brand-lavender/40 border border-brand-violet/20 rounded-3xl text-xs text-brand-navy/70 space-y-2">
        <p className="font-bold text-brand-navy flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-brand-orange" /> Legal Safety Disclaimer
        </p>
        <p>
          RouteBloom is a community cost-sharing information bulletin, not a licensed public carrier, transport contractor, or emergency dispatch service. We do not provide real-time roadside assistance or vehicle tracking. In the event of an emergency on the highway, immediately dial National Emergency Number <strong>112</strong> or Andhra Pradesh Police at <strong>100</strong>.
        </p>
      </div>
    </div>
  );
};
