import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, MessageSquare, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { TeslaEmblem } from '../components/TeslaBranding';

export const ReviewsPage: React.FC = () => {
  const { reviews, addReview, currentUser, vehicles, showNotification } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    author: currentUser?.fullName || '',
    cityCountry: currentUser ? `${currentUser.country}` : '',
    vehicleModel: vehicles[0].model + ' ' + vehicles[0].trim,
    rating: 5,
    title: '',
    content: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.title.trim() || !formData.content.trim()) {
      showNotification('Please fill in all review fields.', 'error');
      return;
    }

    addReview({
      author: formData.author,
      cityCountry: formData.cityCountry || 'United States',
      vehicleClaimed: formData.vehicleModel,
      date: new Date().toISOString().split('T')[0],
      rating: formData.rating,
      title: formData.title,
      content: formData.content
    });

    setIsFormOpen(false);
    setFormData({
      author: currentUser?.fullName || '',
      cityCountry: currentUser ? `${currentUser.country}` : '',
      vehicleModel: vehicles[0].model + ' ' + vehicles[0].trim,
      rating: 5,
      title: '',
      content: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      {/* Header */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 sm:gap-3.5 flex-wrap">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                  FEEDBACK & TRANSPARENCY
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                [Sample Reviews & User Submissions]
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Community Reviews
            </h1>
            <p className="text-sm text-zinc-400">
              Evaluative testimonials and transparency reports. Illustrative seed reviews are
              explicitly labeled to prevent misleading claims.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Compliance Notice */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-start gap-3 text-xs text-zinc-400">
          <ShieldAlert className="w-5 h-5 text-[#E82127] shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-200">HONESTY POLICY:</strong> Under our development constitution,
            we never fabricate customer endorsements or present mock reviews as live customer accounts.
            Pre-seeded entries are marked <code className="text-[#E82127] bg-zinc-900 px-1 py-0.5 rounded">[Sample Review]</code>.
            Real evaluations submitted using the form below are logged in local storage.
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-900">
          <span className="text-xs text-zinc-400">
            Total Reviews: <strong className="text-white tabular-nums">{reviews.length}</strong>
          </span>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto px-4 py-2 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isFormOpen ? 'Cancel Form' : 'Submit Prototype Review'}</span>
          </button>
        </div>

        {/* Submission Form */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4 text-xs animate-in fade-in duration-200"
          >
            <h2 className="text-base font-bold text-white font-display">
              Submit Prototype Feedback
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  City, Country
                </label>
                <input
                  type="text"
                  required
                  value={formData.cityCountry}
                  onChange={e => setFormData({ ...formData, cityCountry: e.target.value })}
                  placeholder="Chicago, US"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Vehicle Evaluated
                </label>
                <select
                  value={formData.vehicleModel}
                  onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={`${v.model} ${v.trim}`}>
                      {v.model} - {v.trim}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Review Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Transparent fee breakdown and quick carrier dispatch"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Review Commentary
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share details on your evaluation of vehicle specs, fee disclosures, and checkout simulation..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#E82127] text-white font-bold text-xs uppercase tracking-wider rounded"
              >
                Publish Review
              </button>
            </div>
          </form>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div
              key={review.id}
              className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E82127]" />
                    {review.isSampleData ? 'Development Sample Record' : 'Participant Submission'}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {review.vehicleClaimed}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {review.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "{review.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-900 text-xs text-zinc-500 flex items-center justify-between">
                <div>
                  <span className="text-zinc-200 font-medium">{review.author}</span>
                  <span className="block text-[11px] text-zinc-500">{review.cityCountry}</span>
                </div>
                <div className="flex items-center gap-0.5 text-[#E82127]">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#E82127] text-[#E82127]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
