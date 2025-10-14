import { useState } from 'react';
import { CircleUser as UserCircle, Heart, MessageCircle, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, type AttendanceStatus, type Side } from '../lib/supabase';

export function RSVPForm() {
  const [formData, setFormData] = useState({
    guest_name: '',
    side: '' as Side,
    attendance_status: '' as AttendanceStatus,
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    console.log("🟢 Sending data to Google Script:", formData);

    try {
      const { error } = await supabase
        .from('rsvp')
        .insert([{
          guest_name: formData.guest_name,
          side: formData.side,
          attendance_status: formData.attendance_status,
          phone: formData.phone || null,
          message: formData.message || null
        }]);
      
      const googleScriptURL = "https://script.google.com/macros/s/AKfycbwr5fIBcd2ecrrt0Rln7qPG2xIy-uUWARCS0lR2zqzItEllvRmlp9A8eMJuaJNJgyYw/exec"; // thay bằng link của bạn
      
      const response = await fetch(googleScriptURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: encodeURIComponent(JSON.stringify(formData)),
      });
      console.log("🟡 Response status:", response.status);
      const text = await response.text();
      console.log("🟢 Response text:", text);


      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        guest_name: '',
        side: '' as Side,
        attendance_status: '' as AttendanceStatus,
        phone: '',
        message: ''
      });

      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <UserCircle className="w-5 h-5 text-rose-500" />
          Tên của bạn <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.guest_name}
          onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <Heart className="w-5 h-5 text-rose-500" />
          Bạn là khách mời của <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, side: 'groom' })}
            className={`py-3 px-4 rounded-xl border-2 transition-all ${
              formData.side === 'groom'
                ? 'border-rose-500 bg-rose-50 text-rose-700 font-semibold'
                : 'border-gray-300 hover:border-rose-300'
            }`}
          >
            Chú Rể
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, side: 'bride' })}
            className={`py-3 px-4 rounded-xl border-2 transition-all ${
              formData.side === 'bride'
                ? 'border-rose-500 bg-rose-50 text-rose-700 font-semibold'
                : 'border-gray-300 hover:border-rose-300'
            }`}
          >
            Cô Dâu
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <CheckCircle className="w-5 h-5 text-rose-500" />
          Tình trạng tham dự <span className="text-rose-500">*</span>
        </label>
        <div className="space-y-3">
          {[
            { value: 'definitely', label: 'Chắc chắn sẽ đến', emoji: '✓', color: 'green' },
            { value: 'maybe', label: 'Có lẽ sẽ đến', emoji: '?', color: 'amber' },
            { value: 'cannot', label: 'Không thể đến', emoji: '✗', color: 'gray' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, attendance_status: option.value as AttendanceStatus })}
              className={`w-full py-3 px-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                formData.attendance_status === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50 font-semibold`
                  : 'border-gray-300 hover:border-rose-300'
              }`}
            >
              <span>{option.label}</span>
              <span className="text-xl">{option.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <Phone className="w-5 h-5 text-rose-500" />
          Số điện thoại <span className="text-gray-400 text-sm font-normal">(Tùy chọn)</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
          placeholder="0912345678"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <MessageCircle className="w-5 h-5 text-rose-500" />
          Lời nhắn <span className="text-gray-400 text-sm font-normal">(Tùy chọn)</span>
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all resize-none"
          placeholder="Gửi lời chúc mừng đến cô dâu chú rể..."
        />
      </div>

      {submitStatus === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>Cảm ơn bạn đã xác nhận! Chúng mình rất mong được gặp bạn.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>Có lỗi xảy ra. Vui lòng thử lại sau.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !formData.guest_name || !formData.side || !formData.attendance_status}
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
      >
        {isSubmitting ? 'Đang gửi...' : 'Xác Nhận Tham Dự'}
      </button>
    </form>
  );
}
