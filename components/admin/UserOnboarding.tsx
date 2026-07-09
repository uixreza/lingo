"use client";
import { motion } from "framer-motion";
import { ComponentProps, useState } from "react";

function Step({ step, currentStep }: { step: number; currentStep: number }) {
  let status =
    currentStep === step
      ? "active"
      : currentStep < step
      ? "inactive"
      : "complete";

  return (
    <motion.div animate={status} className="relative">
      <motion.div
        variants={{
          active: {
            scale: 1,
            transition: {
              delay: 0,
              duration: 0.2,
            },
          },
          complete: {
            scale: 1.25,
          },
        }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          type: "tween",
          ease: "circOut",
        }}
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: "var(--dash-accent)" }}
      />

      <motion.div
        initial={false}
        variants={{
          inactive: {
            backgroundColor: "var(--dash-sides)",
            borderColor: "var(--dash-muted)",
            color: "var(--dash-muted)",
          },
          active: {
            backgroundColor: "var(--dash-sides)",
            borderColor: "var(--dash-accent)",
            color: "var(--dash-accent)",
          },
          complete: {
            backgroundColor: "var(--dash-accent)",
            borderColor: "var(--dash-accent)",
            color: "var(--dash-sides)",
          },
        }}
        transition={{ duration: 0.2 }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold">
        <div className="flex items-center justify-center">
          {status === "complete" ? (
            <CheckIcon className="h-6 w-6" />
          ) : (
            <span>{step}</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default function UserOnboarding() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert("لطفاً یک فایل تصویر (JPEG, PNG, WebP) آپلود کنید.");
        return;
      }

      if (file.size > maxSize) {
        alert("حجم فایل باید کمتر از ۵ مگابایت باشد.");
        return;
      }

      setProfilePicture(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePreview(previewUrl);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log({
      firstName,
      lastName,
      profilePicture,
    });

    // Move to final step
    setStep(3);
  };

  const isStep1Valid = firstName.trim() !== "" && lastName.trim() !== "";

  return (
    <div className="flex fixed left-0 top-0 h-screen w-full flex-1 flex-col items-center justify-center p-4 bg-[var(--dash-bg)]/80 backdrop-blur-md">
      <div
        className="mx-auto w-full max-w-md rounded-2xl shadow-xl border"
        style={{
          backgroundColor: "var(--dash-sides)",
          borderColor: "var(--dash-muted)",
          color: "var(--dash-text)",
        }}>
        {/* Progress Steps */}
        <div className="flex justify-between rounded p-8">
          <Step step={1} currentStep={step} />
          <Step step={2} currentStep={step} />
          <Step step={3} currentStep={step} />
        </div>

        {/* Dynamic content based on `step` */}
        <div className="px-8 pb-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--dash-text)" }}>
                  اطلاعات شخصی
                </h2>
                <p className="mt-2" style={{ color: "var(--dash-muted)" }}>
                  لطفاً نام و نام خانوادگی خود را وارد کنید
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--dash-text)" }}>
                    نام
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
                    style={{
                      backgroundColor: "var(--dash-bg)",
                      borderColor: "var(--dash-muted)",
                      color: "var(--dash-text)",
                    }}
                    placeholder="نام خود را وارد کنید"
                  />
                </div>

                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--dash-text)" }}>
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
                    style={{
                      backgroundColor: "var(--dash-bg)",
                      borderColor: "var(--dash-muted)",
                      color: "var(--dash-text)",
                    }}
                    placeholder="نام خانوادگی خود را وارد کنید"
                  />
                </div>
              </div>

              {isStep1Valid && (
                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: "var(--dash-accent)/10",
                    borderColor: "var(--dash-accent)/30",
                  }}>
                  <p
                    className="text-sm text-center"
                    style={{ color: "var(--dash-accent)" }}>
                    ✓ اطلاعات با موفقیت وارد شد
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--dash-text)" }}>
                  تصویر پروفایل
                </h2>
                <p className="mt-2" style={{ color: "var(--dash-muted)" }}>
                  یک تصویر برای پروفایل خود انتخاب کنید
                </p>
              </div>

              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4">
                {profilePreview ? (
                  <div className="relative">
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4"
                      style={{ borderColor: "var(--dash-accent)" }}
                    />
                    <button
                      onClick={() => {
                        setProfilePicture(null);
                        setProfilePreview("");
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: "var(--dash-accent)" }}>
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center border-2 border-dashed"
                    style={{
                      borderColor: "var(--dash-muted)",
                      backgroundColor: "var(--dash-bg)",
                    }}>
                    <div
                      className="text-4xl"
                      style={{ color: "var(--dash-muted)" }}>
                      👤
                    </div>
                  </div>
                )}

                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-dash-accent/50 w-full"
                  style={{
                    borderColor: "var(--dash-muted)",
                    backgroundColor: "var(--dash-bg)",
                  }}>
                  <input
                    type="file"
                    id="profile-upload"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="cursor-pointer block">
                    <div
                      className="mx-auto h-12 w-12"
                      style={{ color: "var(--dash-muted)" }}>
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="mt-4">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--dash-text)" }}>
                        {profilePicture
                          ? "تغییر تصویر پروفایل"
                          : "برای آپلود کلیک کنید"}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--dash-muted)" }}>
                        PNG, JPG, WebP تا ۵MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {profilePicture && (
                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: "var(--dash-accent)/10",
                    borderColor: "var(--dash-accent)/30",
                  }}>
                  <p
                    className="text-sm text-center"
                    style={{ color: "var(--dash-accent)" }}>
                    ✓ تصویر با موفقیت آپلود شد
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div
                className="mx-auto h-16 w-16"
                style={{ color: "var(--dash-accent)" }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--dash-text)" }}>
                تبریک! پروفایل شما کامل شد
              </h2>

              <div
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: "var(--dash-accent)/10",
                  borderColor: "var(--dash-accent)/30",
                }}>
                <p className="text-sm" style={{ color: "var(--dash-accent)" }}>
                  اطلاعات پروفایل شما با موفقیت ذخیره شد. اکنون می‌توانید از
                  تمام امکانات پلتفرم استفاده کنید.
                </p>
              </div>

              <div className="flex justify-center space-x-4 pt-4">
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2"
                    style={{ borderColor: "var(--dash-accent)" }}
                  />
                )}
                <div className="text-right">
                  <p style={{ color: "var(--dash-text)" }}>
                    {firstName} {lastName}
                  </p>
                  <p className="text-sm" style={{ color: "var(--dash-muted)" }}>
                    خوش آمدید!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(step < 2 ? step : step - 1)}
              className={`${
                step === 1 ? "pointer-events-none opacity-50" : ""
              } duration-350 rounded px-4 py-2 transition border`}
              style={{
                color: "var(--dash-text)",
                borderColor: "var(--dash-muted)",
                backgroundColor: "var(--dash-sides)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--dash-muted)";
                e.currentTarget.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--dash-sides)";
                e.currentTarget.style.opacity = "1";
              }}>
              قبلی
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!isStep1Valid}
                className={`${
                  !isStep1Valid ? "pointer-events-none opacity-50" : ""
                } duration-350 flex items-center justify-center rounded-full py-2 px-6 font-medium tracking-tight text-white transition hover:opacity-90 active:opacity-100`}
                style={{ backgroundColor: "var(--dash-accent)" }}>
                ادامه
              </button>
            ) : step === 2 ? (
              <button
                onClick={handleSubmit}
                className="duration-350 flex items-center justify-center rounded-full py-2 px-6 font-medium tracking-tight text-white transition hover:opacity-90 active:opacity-100"
                style={{ backgroundColor: "var(--dash-accent)" }}>
                تکمیل پروفایل
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="duration-350 flex items-center justify-center rounded-full py-2 px-6 font-medium tracking-tight text-white transition hover:opacity-90 active:opacity-100"
                style={{ backgroundColor: "var(--dash-accent)" }}>
                رفتن به داشبورد
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
