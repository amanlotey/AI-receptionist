import React, { useState } from "react";

const AgentConfigTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Persona");
  const [faqs, setFaqs] = useState([{ q: "What are your hours?", a: "9am to 5pm" }]);

  const addFaq = () => setFaqs([...faqs, { q: "", a: "" }]);
  const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx));

  return (
    <section className="flex-1 p-4">
      <div className="flex gap-3 mb-3">
        {["Persona", "Greeting", "FAQ"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1 rounded ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Persona" && (
        <div className="space-y-3">
          <input
            placeholder="Agent Name"
            className="w-full bg-neutral-800 text-gray-300 px-3 py-1 rounded"
          />
          <input
            placeholder="Tone (Friendly, Formal...)"
            className="w-full bg-neutral-800 text-gray-300 px-3 py-1 rounded"
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Allow Barge-in
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Escalate to Human
            </label>
          </div>
          <button className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500 text-sm">
            Save Persona
          </button>
        </div>
      )}

      {activeTab === "Greeting" && (
        <div className="space-y-3">
          <textarea
            placeholder="Edit greeting message..."
            rows={4}
            className="w-full bg-neutral-800 text-gray-300 px-3 py-2 rounded"
          />
          <button className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500 text-sm">
            Save Greeting
          </button>
        </div>
      )}

      {activeTab === "FAQ" && (
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={faq.q}
                placeholder="Question"
                className="flex-1 bg-neutral-800 text-gray-300 px-2 py-1 rounded"
              />
              <input
                value={faq.a}
                placeholder="Answer"
                className="flex-1 bg-neutral-800 text-gray-300 px-2 py-1 rounded"
              />
              <button
                className="text-red-400 text-xs"
                onClick={() => removeFaq(i)}
              >
                ✖
              </button>
            </div>
          ))}
          <button
            className="bg-neutral-700 px-2 py-1 rounded text-sm hover:bg-neutral-600"
            onClick={addFaq}
          >
            + Add FAQ
          </button>
          <button className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500 text-sm">
            Save FAQs
          </button>
        </div>
      )}
    </section>
  );
};

export default AgentConfigTabs;
