# نظام تخطيط الفعاليات - Frontend

تطبيق Angular حديث ومتكامل لإدارة وتخطيط الفعاليات مع دعم كامل لـ Backend API.

## ✨ المميزات

- 🔐 نظام مصادقة كامل (تسجيل دخول، تسجيل مستخدم جديد)
- 📅 إدارة الفعاليات (إنشاء، تعديل، حذف، عرض)
- 👥 إدارة المدعوين والحضور
- 🔍 البحث والفلترة المتقدمة
- 🎯 Dashboard تفاعلي لعرض جميع الفعاليات
- 🔒 Token-based Authentication مع Backend
- ⚡ HTTP Interceptor لحقن Token تلقائياً
- 🎨 تصميم عصري وسهل الاستخدام

## 🔧 المتطلبات

- Node.js (الإصدار 14.0.0 أو أحدث)
- npm (الإصدار 6.0.0 أو أحدث)
- Angular CLI (الإصدار 17.0.0 أو أحدث)
- **Backend API يعمل على `http://127.0.0.1:8000`**

## 📦 التثبيت

1. تثبيت Angular CLI عالمياً (إذا لم يكن مثبتاً):
   ```bash
   npm install -g @angular/cli
   ```

2. استنساخ المشروع:
   ```bash
   git clone <repository-link>
   cd FrontendEventPlanningSystem
   ```

3. تثبيت الحزم:
   ```bash
   npm install
   ```

## 🚀 تشغيل المشروع

### 1. تشغيل Backend (مطلوب!)
تأكد من تشغيل Backend API أولاً:
```bash
# في مجلد Backend
python manage.py runserver
```

### 2. تشغيل Frontend
```bash
npm start
# أو
ng serve
```

افتح المتصفح على: `http://localhost:4200`

## 🏗️ البنية الأساسية

```
src/
├── app/
│   ├── components/
│   │   ├── login/              # صفحة تسجيل الدخول
│   │   ├── signup/             # صفحة التسجيل
│   │   ├── dashboard/          # لوحة التحكم الرئيسية
│   │   ├── create-event/       # صفحة إنشاء فعالية
│   │   └── event-details-page/ # صفحة تفاصيل الفعالية
│   ├── services/
│   │   ├── auth.service.ts         # خدمة المصادقة
│   │   ├── event.service.ts        # خدمة إدارة الفعاليات
│   │   └── local-storage.service.ts # خدمة التخزين المحلي
│   ├── interceptors/
│   │   └── auth.interceptor.ts # حقن Token تلقائياً
│   ├── guards/
│   │   └── auth.guard.ts       # حماية المسارات
│   ├── models/
│   │   ├── user.model.ts       # نموذج المستخدم
│   │   ├── event.model.ts      # نموذج الفعالية
│   │   └── task.model.ts       # نموذج المهمة
│   └── environments/
│       ├── environment.ts       # إعدادات التطوير
│       └── environment.prod.ts  # إعدادات الإنتاج
```

## 🔌 Backend Integration

### Endpoints المستخدمة:

#### Authentication
- `POST /api/auth/signup/` - تسجيل مستخدم جديد
- `POST /api/auth/login/` - تسجيل الدخول

#### Events
- `GET /api/events/` - جلب الفعاليات التي أنشأها المستخدم
- `GET /api/events/invited/` - جلب الفعاليات المدعو إليها
- `POST /api/events/create/` - إنشاء فعالية جديدة
- `GET /api/events/{id}` - جلب تفاصيل فعالية محددة
- `PATCH /api/events/{id}/details/` - تعديل فعالية
- `DELETE /api/events/{id}/delete/` - حذف فعالية

#### Invitees & Attendance
- `POST /api/events/{id}/invitees/` - إضافة مدعو
- `DELETE /api/events/{id}/invitees/{email}` - حذف مدعو
- `PATCH /api/events/{id}/attendance/` - تحديث حالة الحضور

#### Search
- `GET /api/events/search/` - البحث في الفعاليات

### Token Authentication

جميع الطلبات للـ Backend تتضمن Token في الـ headers:
```
Authorization: Token <your-token-here>
```

يتم إضافة Token تلقائياً بواسطة HTTP Interceptor.

## 📝 الاستخدام

### 1. التسجيل
- اذهب لصفحة Signup
- أدخل Username، Email، وPassword
- بعد التسجيل الناجح، سيتم توجيهك للـ Dashboard

### 2. تسجيل الدخول
- أدخل Username وPassword
- عند النجاح، يتم حفظ Token وتوجيهك للـ Dashboard

### 3. إنشاء فعالية
- من Dashboard، اضغط "Create Event"
- املأ جميع الحقول المطلوبة
- (اختياري) أضف emails للمدعوين
- اضغط "Create"

### 4. إدارة الفعاليات
- عرض جميع الفعاليات في Dashboard
- تعديل أو حذف الفعاليات الخاصة بك
- تحديث حالة الحضور للفعاليات المدعو إليها

## ⚙️ الإعدادات

### تغيير عنوان Backend

في ملف `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000',  // غير هذا العنوان
  useLocalStorage: false
};
```

### وضع Development (Local Storage)

إذا أردت استخدام Local Storage بدلاً من Backend للتطوير:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000',
  useLocalStorage: true  // غيّر إلى true
};
```

## 🧪 الاختبار

### اختبارات يدوية
راجع ملف [walkthrough.md](file:///C:/Users/Bahaa/.gemini/antigravity/brain/d9286798-416e-4376-b413-2e08f85bb051/walkthrough.md) للحصول على دليل اختبار شامل.

### اختبارات تلقائية
```bash
npm test
```

## 🔐 الأمان

- ✅ Token-based authentication
- ✅ Auto redirect عند انتهاء صلاحية Token (401)
- ✅ Route guards لحماية الصفحات
- ✅ CORS handling في Backend
- ✅ Validation شامل للبيانات

## 🐛 حل المشاكل

### Cannot connect to server
**الحل:** تأكد من تشغيل Backend على `http://127.0.0.1:8000`

### CORS Error
**الحل:** تحقق من إعدادات CORS في Backend:
```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]
```

### Token لا يُرسل
**الحل:** تأكد من تسجيل HTTP Interceptor في `app.config.ts`

## 📚 الوثائق الإضافية

- [خطة التنفيذ](file:///C:/Users/Bahaa/.gemini/antigravity/brain/d9286798-416e-4376-b413-2e08f85bb051/implementation_plan.md)
- [دليل الاختبار](file:///C:/Users/Bahaa/.gemini/antigravity/brain/d9286798-416e-4376-b413-2e08f85bb051/walkthrough.md)
- [قائمة المهام](file:///C:/Users/Bahaa/.gemini/antigravity/brain/d9286798-416e-4376-b413-2e08f85bb051/task.md)

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. نفذ التغييرات
4. Commit التغييرات (`git commit -m 'Add amazing feature'`)
5. Push للـ branch (`git push origin feature/amazing-feature`)
6. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License.

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح issue في GitHub.

---

**تم ربط المشروع بالكامل مع Backend API ✅**
