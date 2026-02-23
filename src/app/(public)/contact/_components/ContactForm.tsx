"use client";

import { CheckCircle, Send } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const inquiryTypes = [
  "General Inquiry",
  "Membership Application",
  "Partnership Opportunity",
  "Event Inquiry",
  "Media & Press",
  "Other",
];

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inquiryType, setInquiryType] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inquiryType) return;

    setIsLoading(true);

    const emailBody = `
New Contact Form Submission
──────────────────────────

Name:
${formData.firstName} ${formData.lastName}

Email:
${formData.email}

Phone:
${formData.phone || "N/A"}

Company / Organization:
${formData.company || "N/A"}

Inquiry Type:
${inquiryType}

Message:
${formData.message}

Submitted On:
${new Date().toLocaleString()}

──────────────────────────
Sent via Website Contact Form
    `.trim();

    const mailto = `mailto:siaotongkj@gmail.com?subject=${encodeURIComponent(`Contact Form Inquiry — ${inquiryType}`)}&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailto;

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    });
    setInquiryType("");
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, x: 0 }}
    >
      <h2 className="mb-2 font-bold text-2xl text-foreground sm:text-3xl">
        Send Us a Message
      </h2>
      <p className="mb-8 text-muted-foreground">
        Fill out the form below and we'll get back to you as soon as possible.
      </p>

      {isSubmitted ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto mb-4 inline-flex rounded-xl bg-primary/10 p-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground text-xl">
            Message Sent!
          </h3>
          <p className="mb-6 text-muted-foreground">
            Thank you for reaching out. <br />
            We'll respond to your inquiry within 1-2 business days.
          </p>
          <Button
            className="rounded-xl"
            onClick={() => setIsSubmitted(false)}
            variant="outline"
          >
            Send Another Message
          </Button>
        </motion.div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                className="rounded-xl placeholder:opacity-50"
                id="firstName"
                onChange={handleInputChange}
                placeholder="Juan"
                required
                value={formData.firstName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                className="rounded-xl placeholder:opacity-50"
                id="lastName"
                onChange={handleInputChange}
                placeholder="Dela Cruz"
                required
                value={formData.lastName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              className="rounded-xl placeholder:opacity-50"
              id="email"
              onChange={handleInputChange}
              placeholder="juan@example.com"
              required
              type="email"
              value={formData.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              className="rounded-xl placeholder:opacity-50"
              id="phone"
              onChange={handleInputChange}
              placeholder="+63 912 345 6789"
              type="tel"
              value={formData.phone}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company/Organization</Label>
            <Input
              className="rounded-xl placeholder:opacity-50"
              id="company"
              onChange={handleInputChange}
              placeholder="Your Company Name"
              value={formData.company}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiryType">Type of Inquiry</Label>
            <Select
              onValueChange={(value: string | null) =>
                setInquiryType(value ?? "")
              }
              value={inquiryType}
            >
              <SelectTrigger className="w-full rounded-xl">
                {inquiryType ? (
                  <SelectValue />
                ) : (
                  <span className="text-muted-foreground">
                    Select type of inquiry
                  </span>
                )}
              </SelectTrigger>
              <SelectContent>
                {inquiryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              className="rounded-xl placeholder:opacity-50"
              id="message"
              onChange={handleInputChange}
              placeholder="How can we help you?"
              required
              rows={5}
              value={formData.message}
            />
          </div>

          <Button
            className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              "Sending..."
            ) : (
              <>
                Send Message
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </motion.div>
  );
}
