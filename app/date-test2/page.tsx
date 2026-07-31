"use client";

import { useState } from "react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/layouts/prime.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";

export default function DateTestPage() {
  const [birthDate, setBirthDate] = useState<DateObject | null>(
    () => new DateObject().convert(persian, persian_fa),
  );

  const simple = new DateObject().convert(persian, persian_fa);

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>Date test</h1>
      <p id="dbg-simple">simple convert: {simple.format("YYYY/MM/DD")}</p>
      <p id="dbg-state">state: {birthDate ? birthDate.format("YYYY/MM/DD") : "null"}</p>
      <DatePicker
        value={birthDate}
        onChange={(v) => {
          console.log("onChange raw:", v);
          setBirthDate(v as DateObject | null);
        }}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        inputClass="rmdp-input"
      />
    </div>
  );
}
