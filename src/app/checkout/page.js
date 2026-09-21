'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  InputAdornment,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

import { getTripById } from '@/actions/search';
import { createBooking, processMockPayment } from '@/actions/booking';
import { CheckoutSchema } from '@/lib/validations';
import BookingSummary from '@/components/BookingSummary';
import LoadingState from '@/components/LoadingState';

const sampleCoupons = [
  { code: 'FIRSTBUS', desc: 'Flat ₹100 Off on your first trip booking.', value: 100 },
  { code: 'BUS100', desc: 'Flat ₹100 Off discount coupon code.', value: 100 },
  { code: 'WELCOME50', desc: 'Welcome bonus: Flat 50% discount on total price.', isPercent: true },
];

function detectCardType(number) {
  const clean = number.replace(/\D/g, '');
  if (/^4/.test(clean)) return { name: 'Visa', color: '#1A1F71' };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: '#EB001B' };
  if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', color: '#097939' };
  if (/^3[47]/.test(clean)) return { name: 'Amex', color: '#006FCF' };
  return { name: 'Card', color: '#64748B' };
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const tripId = searchParams.get('tripId') || '';
  const seatsParam = searchParams.get('seats') || '';
  const selectedSeats = seatsParam ? seatsParam.split(',') : [];
  const passengersCount = parseInt(searchParams.get('passengers') || '1', 10);
  const boardingParam = searchParams.get('boarding') || '';
  const droppingParam = searchParams.get('dropping') || '';

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stepper state
  const [activeStep, setActiveStep] = useState(2); // Step 2: Traveler Info, Step 3: Payment
  const steps = ['Select Route', 'Reserve Seat', 'Traveler Info', 'Payment', 'Digital Ticket'];

  // Coupon / Discount states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'wallet'

  // Card payment state
  const [cardHolder, setCardHolder] = useState('John Doe');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('123');

  // UPI payment state
  const [upiId, setUpiId] = useState('rajasekar@upi');
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiError, setUpiError] = useState('');

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState('');
  const [bankVerified, setBankVerified] = useState(false);
  const [bankError, setBankError] = useState('');

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState('');
  const [walletVerified, setWalletVerified] = useState(false);
  const [walletError, setWalletError] = useState('');

  // Payment validation / failure banner
  const [paymentValidationMsg, setPaymentValidationMsg] = useState('');

  // Payment Modal Experience (Processing -> Success / Failure)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalState, setPaymentModalState] = useState('processing'); // 'processing' | 'success' | 'failure'
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);
  const [processingTime, setProcessingTime] = useState('Authorizing transaction...');

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      tripId,
      selectedSeats,
      passengerDetails: Array.from({ length: selectedSeats.length || passengersCount }).map(() => ({
        name: '',
        age: 18,
        gender: 'MALE',
      })),
      contactEmail: '',
      contactPhone: '',
      boardingPoint: boardingParam || '',
      droppingPoint: droppingParam || '',
      discountAmount: 0,
      appliedCoupon: '',
      paymentMethod: 'card',
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'passengerDetails',
  });

  // Pre-fill details
  useEffect(() => {
    if (session?.user) {
      setValue('contactEmail', session.user.email || '');
    }
  }, [session, setValue]);

  // Load trip details
  useEffect(() => {
    if (!tripId || selectedSeats.length === 0) {
      setError('Invalid checkout session. Please select a bus and seats first.');
      setLoading(false);
      return;
    }

    getTripById(tripId)
      .then((res) => {
        if (res.success && res.data) {
          setTrip(res.data);
          if (!boardingParam) {
            setValue('boardingPoint', `${res.data.route.source} Central Terminal`);
          }
          if (!droppingParam) {
            setValue('droppingPoint', `${res.data.route.destination} Central Terminal`);
          }
        } else {
          setError(res.error || 'Failed to retrieve trip details.');
        }
      })
      .catch(() => setError('Error loading journey.'))
      .finally(() => setLoading(false));
  }, [tripId, setValue, selectedSeats.length, boardingParam, droppingParam]);

  // Handle redirect if not logged in
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
    }
  }, [authStatus]);

  // Dynamic Fare calculation
  const priceINR = trip ? trip.price * 84 : 0;
  const baseFare = Math.round(priceINR * selectedSeats.length);
  const serviceTax = Math.round(baseFare * 0.05);
  const bookingFee = Math.round(selectedSeats.length * 20);
  const subtotal = baseFare + serviceTax + bookingFee;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Apply Coupon discount
  const handleApplyCouponCode = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!trip) return;

    let discount = 0;
    if (code === 'FIRSTBUS' || code === 'BUS100') {
      discount = 100;
    } else if (code === 'WELCOME50') {
      discount = Math.round(subtotal * 0.5);
    } else {
      alert('Invalid coupon code!');
      return;
    }

    setDiscountAmount(discount);
    setAppliedCoupon(code);
    setCouponInput(code);
    setValue('discountAmount', discount);
    setValue('appliedCoupon', code);
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    const isValid = await trigger(['passengerDetails', 'contactEmail', 'contactPhone', 'boardingPoint', 'droppingPoint']);
    if (isValid) {
      setActiveStep(3); // Move to payment
    }
  };

  // Switch Payment Method
  const handlePaymentMethodChange = (newMethod) => {
    setPaymentMethod(newMethod);
    setValue('paymentMethod', newMethod);
    setPaymentValidationMsg('');
    setUpiError('');
    setBankError('');
    setWalletError('');
  };

  // Card Formatters & Validation
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
    setPaymentValidationMsg('');
  };

  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardExpiry(val);
    setPaymentValidationMsg('');
  };

  const handleCardCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardCvv(val);
    setPaymentValidationMsg('');
  };

  // UPI Verification
  const handleVerifyUpi = () => {
    const trimmed = upiId.trim();
    if (!trimmed) {
      setUpiError('Please enter your UPI ID.');
      setUpiVerified(false);
      return;
    }
    if (!trimmed.includes('@') || trimmed.length < 4 || trimmed.startsWith('@') || trimmed.endsWith('@')) {
      setUpiError('Please enter a valid UPI ID (e.g. username@upi).');
      setUpiVerified(false);
      return;
    }
    setUpiError('');
    setUpiVerified(true);
    setPaymentValidationMsg('');
  };

  // Net Banking Verification
  const handleVerifyBank = () => {
    if (!selectedBank) {
      setBankError('Please select your bank.');
      setBankVerified(false);
      return;
    }
    setBankError('');
    setBankVerified(true);
    setPaymentValidationMsg('');
  };

  // Wallet Verification
  const handleVerifyWallet = () => {
    if (!selectedWallet) {
      setWalletError('Please select a mobile wallet.');
      setWalletVerified(false);
      return;
    }
    setWalletError('');
    setWalletVerified(true);
    setPaymentValidationMsg('');
  };

  // Main Secure Payment Action
  const handleSecurePay = async (e) => {
    if (e) e.preventDefault();
    setPaymentValidationMsg('');

    // Method-specific frontend validation
    if (paymentMethod === 'card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (!cardHolder.trim()) {
        setPaymentValidationMsg('Please enter the Card Holder Name.');
        return;
      }
      if (rawCard.length !== 16) {
        setPaymentValidationMsg('Please enter a valid 16-digit card number.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry.trim())) {
        setPaymentValidationMsg('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (!/^[0-9]{3,4}$/.test(cardCvv.trim())) {
        setPaymentValidationMsg('Please enter a valid 3 or 4 digit CVV code.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim()) {
        setPaymentValidationMsg('Please enter your UPI ID.');
        return;
      }
      if (!upiVerified) {
        setPaymentValidationMsg('Please verify your UPI ID by clicking "Verify UPI".');
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        setPaymentValidationMsg('Please select your bank.');
        return;
      }
      if (!bankVerified) {
        setPaymentValidationMsg('Please click "Continue" to verify your bank selection.');
        return;
      }
    } else if (paymentMethod === 'wallet') {
      if (!selectedWallet) {
        setPaymentValidationMsg('Please select your mobile wallet.');
        return;
      }
      if (!walletVerified) {
        setPaymentValidationMsg('Please click "Continue" to verify your wallet selection.');
        return;
      }
    }

    // Validate traveler inputs
    const isValid = await trigger(['passengerDetails', 'contactEmail', 'contactPhone', 'boardingPoint', 'droppingPoint']);
    if (!isValid) {
      setActiveStep(2);
      return;
    }

    const currentValues = control._formValues;
    const phone = currentValues.contactPhone;
    if (phone && phone.startsWith('+91') && phone.length !== 13) {
      setPaymentValidationMsg('Invalid Indian mobile number. Should contain country code +91 and 10 digits.');
      return;
    }

    // Launch Professional Payment Processing Overlay
    setPaymentModalOpen(true);
    setPaymentModalState('processing');
    setProcessingTime('Contacting payment gateway...');

    try {
      // 1. Create booking in database
      const res = await createBooking({
        ...currentValues,
        tripId,
        selectedSeats,
        discountAmount: discountAmount || 0,
        appliedCoupon: appliedCoupon || '',
        paymentMethod,
      });

      if (!res.success || !res.bookingId) {
        setPaymentModalState('failure');
        setPaymentValidationMsg(res.error || 'Booking creation failed.');
        return;
      }

      setProcessingTime('Authorizing ₹' + finalTotal + ' securely...');
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // 2. Authorize payment
      const payRes = await processMockPayment(res.bookingId);
      if (!payRes.success) {
        setPaymentModalState('failure');
        setPaymentValidationMsg(payRes.error || 'Payment authorization failed.');
        return;
      }

      // 3. Show Success Screen
      const pnrCode = res.pnr || payRes.booking?.pnr || 'NXB' + Math.floor(100000 + Math.random() * 900000);
      setConfirmedBookingData({
        pnr: pnrCode,
        amount: finalTotal,
        method: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'upi' ? 'UPI Instant Payment' : paymentMethod === 'netbanking' ? 'Net Banking' : 'Mobile Wallet',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      });
      setPaymentModalState('success');
    } catch (err) {
      setPaymentModalState('failure');
      setPaymentValidationMsg(err.message || 'Payment processing failed. Please try again.');
    }
  };

  if (authStatus === 'loading' || loading) {
    return <LoadingState message="Loading secure checkout..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!trip) return null;

  const detectedCard = detectCardType(cardNumber);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Stepper Progress */}
      <Box sx={{ width: '100%', mb: 6 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ '& .MuiStepIcon-root.Mui-active': { color: 'secondary.main' }, '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' } }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconProps={{ style: { fontSize: '22px' } }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: 'primary.main', letterSpacing: '-0.02em' }}>
        {activeStep === 2 ? 'Traveler Verification' : 'Payment Information'}
      </Typography>

      <form onSubmit={handleSubmit(handleSecurePay)}>
        {/* Hidden Form bindings */}
        <input type="hidden" {...register('tripId')} />
        {selectedSeats.map((seat, idx) => (
          <input key={seat} type="hidden" value={seat} {...register(`selectedSeats.${idx}`)} />
        ))}
        <input type="hidden" {...register('boardingPoint')} />
        <input type="hidden" {...register('droppingPoint')} />
        <input type="hidden" {...register('discountAmount')} />
        <input type="hidden" {...register('appliedCoupon')} />
        <input type="hidden" {...register('paymentMethod')} />

        <Grid container spacing={4}>
          {/* Left Column: Form Details */}
          <Grid item xs={12} md={7.5}>
            {activeStep === 2 ? (
              // ----------------------------------------------------
              // Step 2: Traveler Info & Contact Details
              // ----------------------------------------------------
              <Box>
                {/* Passenger Forms */}
                <Card sx={{ p: 4, mb: 4, border: '1px solid #E2E8F0', borderRadius: 3.5, backgroundColor: '#ffffff' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 850, mb: 3.5, color: 'primary.main' }}>
                    Traveler Details
                  </Typography>

                  {fields.map((field, index) => (
                    <Box key={field.id} sx={{ mb: index !== fields.length - 1 ? 4 : 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, mb: 2.5, color: 'secondary.main', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Passenger {index + 1} (Seat {selectedSeats[index] || `Seat ${index+1}`})
                      </Typography>

                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Full Name"
                            variant="outlined"
                            fullWidth
                            required
                            {...register(`passengerDetails.${index}.name`)}
                            error={!!errors.passengerDetails?.[index]?.name}
                            helperText={errors.passengerDetails?.[index]?.name?.message}
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Age"
                            type="number"
                            variant="outlined"
                            fullWidth
                            required
                            {...register(`passengerDetails.${index}.age`)}
                            error={!!errors.passengerDetails?.[index]?.age}
                            helperText={errors.passengerDetails?.[index]?.age?.message}
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <FormControl fullWidth error={!!errors.passengerDetails?.[index]?.gender} required>
                            <InputLabel>Gender</InputLabel>
                            <Select
                              label="Gender"
                              defaultValue={field.gender || 'MALE'}
                              {...register(`passengerDetails.${index}.gender`)}
                            >
                              <MenuItem value="MALE">Male</MenuItem>
                              <MenuItem value="FEMALE">Female</MenuItem>
                              <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                            <FormHelperText>{errors.passengerDetails?.[index]?.gender?.message}</FormHelperText>
                          </FormControl>
                        </Grid>
                      </Grid>
                      {index !== fields.length - 1 && <Divider sx={{ mt: 3.5 }} />}
                    </Box>
                  ))}
                </Card>

                {/* Contact Details */}
                <Card sx={{ p: 4, mb: 4, border: '1px solid #E2E8F0', borderRadius: 3.5, backgroundColor: '#ffffff' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 850, mb: 3.5, color: 'primary.main' }}>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        fullWidth
                        required
                        {...register('contactEmail')}
                        error={!!errors.contactEmail}
                        helperText={errors.contactEmail?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone Number"
                        variant="outlined"
                        placeholder="E.g. +919988776655"
                        fullWidth
                        required
                        {...register('contactPhone')}
                        error={!!errors.contactPhone}
                        helperText={errors.contactPhone?.message || "Include country code (e.g., +91 for India)"}
                      />
                    </Grid>
                  </Grid>
                </Card>

                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  onClick={handleProceedToPayment}
                  sx={{ py: 1.8, fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.02em', borderRadius: 2 }}
                >
                  Proceed to Payment
                </Button>
              </Box>
            ) : (
              // ----------------------------------------------------
              // Step 3: Professional Payment Experience
              // ----------------------------------------------------
              <Box>
                <Card sx={{ p: 4, mb: 4, border: '1px solid #E2E8F0', borderRadius: 3.5, backgroundColor: '#ffffff' }}>
                  
                  {/* Header & Security Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'primary.main' }}>
                      Choose Payment Method
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'success.main', bgcolor: 'rgba(16, 185, 129, 0.08)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                      <SecurityIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        256-Bit SSL Encrypted
                      </Typography>
                    </Box>
                  </Box>

                  {/* 4 Payment Methods Cards */}
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    sx={{ gap: 2 }}
                  >
                    {[
                      { value: 'card', label: 'Credit / Debit Card', icon: <CreditCardIcon />, desc: 'Visa, MasterCard, RuPay, Maestro, Amex' },
                      { value: 'upi', label: 'UPI / Instant Payment', icon: <QrCodeIcon />, desc: 'Google Pay, PhonePe, Paytm, BHIM UPI' },
                      { value: 'netbanking', label: 'Net Banking', icon: <AccountBalanceIcon />, desc: 'SBI, HDFC, ICICI, Axis, Kotak, Yes Bank' },
                      { value: 'wallet', label: 'Mobile Wallet / Pay Later', icon: <AccountBalanceWalletIcon />, desc: 'Paytm Wallet, Mobikwik, Amazon Pay' },
                    ].map((method) => (
                      <Card
                        key={method.value}
                        id={`payment-method-${method.value}`}
                        sx={{
                          p: 2.5,
                          border: paymentMethod === method.value ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: paymentMethod === method.value ? 'rgba(37, 99, 235, 0.02)' : '#ffffff',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'secondary.light'
                          }
                        }}
                        onClick={() => handlePaymentMethodChange(method.value)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FormControlLabel
                            value={method.value}
                            control={<Radio color="secondary" />}
                            label=""
                            sx={{ mr: -1.5 }}
                          />
                          <Box sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center' }}>
                            {method.icon}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {method.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 550 }}>
                              {method.desc}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </RadioGroup>

                  <Divider sx={{ my: 3.5 }} />

                  {/* 1. Credit / Debit Card Panel */}
                  {paymentMethod === 'card' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <TextField
                        id="card-holder-input"
                        label="Card Holder Name"
                        value={cardHolder}
                        onChange={(e) => { setCardHolder(e.target.value); setPaymentValidationMsg(''); }}
                        placeholder="John Doe"
                        fullWidth
                        size="small"
                        required
                      />
                      <TextField
                        id="card-number-input"
                        label="Card Number"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 1111 1111 1111"
                        fullWidth
                        size="small"
                        required
                        inputProps={{ maxLength: 19 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Chip
                                label={detectedCard.name}
                                size="small"
                                sx={{
                                  bgcolor: detectedCard.color,
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  height: 22
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            id="card-expiry-input"
                            label="Expiry Date"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            placeholder="12/29"
                            fullWidth
                            size="small"
                            required
                            inputProps={{ maxLength: 5 }}
                            helperText="MM/YY"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            id="card-cvv-input"
                            label="CVV / CVC"
                            value={cardCvv}
                            onChange={handleCardCvvChange}
                            placeholder="123"
                            fullWidth
                            size="small"
                            required
                            type="password"
                            inputProps={{ maxLength: 4 }}
                            helperText="3 or 4 digits on back"
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'text.secondary' }}>
                        <LockIcon sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                          Your card details are protected by 256-bit encryption. CVV is never stored.
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* 2. UPI Instant Payment Panel */}
                  {paymentMethod === 'upi' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Enter your Virtual Payment Address (VPA) / UPI ID:
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <TextField
                          id="upi-id-input"
                          label="UPI ID"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            setUpiVerified(false);
                            setUpiError('');
                            setPaymentValidationMsg('');
                          }}
                          placeholder="username@upi"
                          fullWidth
                          size="small"
                          error={!!upiError}
                          helperText={upiError || "Example: username@okhdfcbank, mobile@upi"}
                        />
                        <Button
                          id="verify-upi-btn"
                          variant="contained"
                          color="secondary"
                          onClick={handleVerifyUpi}
                          sx={{ fontWeight: 700, whiteSpace: 'nowrap', py: 1, px: 2.5, borderRadius: 1.5 }}
                        >
                          Verify UPI
                        </Button>
                      </Box>

                      {upiVerified && (
                        <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}>
                          ✓ UPI ID verified
                        </Alert>
                      )}

                      {/* Supported UPI Apps Badges */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                        {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM', 'Amazon Pay UPI'].map((app) => (
                          <Chip key={app} label={app} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* 3. Net Banking Panel */}
                  {paymentMethod === 'netbanking' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Select Your Bank for Internet Banking:
                      </Typography>

                      <FormControl fullWidth size="small" error={!!bankError}>
                        <InputLabel id="bank-select-label">Select Bank</InputLabel>
                        <Select
                          id="bank-select"
                          labelId="bank-select-label"
                          value={selectedBank}
                          label="Select Bank"
                          onChange={(e) => {
                            setSelectedBank(e.target.value);
                            setBankVerified(false);
                            setBankError('');
                            setPaymentValidationMsg('');
                          }}
                        >
                          <MenuItem value="sbi">State Bank of India (SBI)</MenuItem>
                          <MenuItem value="hdfc">HDFC Bank</MenuItem>
                          <MenuItem value="icici">ICICI Bank</MenuItem>
                          <MenuItem value="axis">Axis Bank</MenuItem>
                          <MenuItem value="kotak">Kotak Mahindra Bank</MenuItem>
                          <MenuItem value="yes">Yes Bank</MenuItem>
                          <MenuItem value="bob">Bank of Baroda</MenuItem>
                          <MenuItem value="pnb">Punjab National Bank</MenuItem>
                          <MenuItem value="canara">Canara Bank</MenuItem>
                          <MenuItem value="idfc">IDFC FIRST Bank</MenuItem>
                        </Select>
                        {bankError && <FormHelperText>{bankError}</FormHelperText>}
                      </FormControl>

                      <Button
                        id="verify-bank-btn"
                        variant="contained"
                        color="secondary"
                        onClick={handleVerifyBank}
                        sx={{ fontWeight: 700, py: 1, borderRadius: 1.5, alignSelf: 'flex-start', px: 3 }}
                      >
                        Continue
                      </Button>

                      {bankVerified && (
                        <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}>
                          ✓ Bank verified
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* 4. Mobile Wallet Panel */}
                  {paymentMethod === 'wallet' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Select your digital wallet provider:
                      </Typography>

                      <FormControl fullWidth size="small" error={!!walletError}>
                        <InputLabel id="wallet-select-label">Select Wallet</InputLabel>
                        <Select
                          id="wallet-select"
                          labelId="wallet-select-label"
                          value={selectedWallet}
                          label="Select Wallet"
                          onChange={(e) => {
                            setSelectedWallet(e.target.value);
                            setWalletVerified(false);
                            setWalletError('');
                            setPaymentValidationMsg('');
                          }}
                        >
                          <MenuItem value="paytm">Paytm Wallet</MenuItem>
                          <MenuItem value="mobikwik">Mobikwik</MenuItem>
                          <MenuItem value="amazon">Amazon Pay</MenuItem>
                        </Select>
                        {walletError && <FormHelperText>{walletError}</FormHelperText>}
                      </FormControl>

                      <Button
                        id="verify-wallet-btn"
                        variant="contained"
                        color="secondary"
                        onClick={handleVerifyWallet}
                        sx={{ fontWeight: 700, py: 1, borderRadius: 1.5, alignSelf: 'flex-start', px: 3 }}
                      >
                        Continue
                      </Button>

                      {walletVerified && (
                        <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}>
                          ✓ Wallet verified
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Validation Error Alert */}
                  {paymentValidationMsg && (
                    <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />} sx={{ mt: 3, borderRadius: 2, fontWeight: 700 }}>
                      {paymentValidationMsg}
                    </Alert>
                  )}
                </Card>

                {/* Back and Confirm & Pay Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    id="checkout-go-back-btn"
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => setActiveStep(2)}
                    sx={{ py: 1.5, fontWeight: 700, borderRadius: 2, px: 3 }}
                  >
                    Go Back
                  </Button>
                  <Button
                    id="confirm-pay-btn"
                    type="button"
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    onClick={handleSecurePay}
                    startIcon={<LockIcon />}
                    sx={{
                      py: 1.6,
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      letterSpacing: '0.01em',
                      borderRadius: 2,
                    }}
                  >
                    Pay ₹{finalTotal} Securely
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1.8, color: 'text.secondary' }}>
                  <VerifiedUserIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 650, fontSize: '0.74rem' }}>
                    100% Safe & Secure Payment • Instant Booking Confirmation
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>

          {/* Right Column: Fare Summary & Offers */}
          <Grid item xs={12} md={4.5}>
            <BookingSummary
              trip={trip}
              seats={selectedSeats}
              boardingPoint={boardingParam || `${trip.route.source} Central Terminal`}
              droppingPoint={droppingParam || `${trip.route.destination} Central Terminal`}
              discountAmount={discountAmount}
              couponCode={appliedCoupon}
            />

            {/* Coupons section */}
            <Card sx={{ p: 3, mt: 3, border: '1px solid #E2E8F0', borderRadius: 3, backgroundColor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 850, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon color="secondary" sx={{ fontSize: 18 }} /> Apply Promo Coupon
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                <TextField
                  id="coupon-input"
                  placeholder="E.g. FIRSTBUS"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ input: { textTransform: 'uppercase', fontWeight: 700 } }}
                />
                <Button
                  id="apply-coupon-btn"
                  variant="contained"
                  color="secondary"
                  onClick={() => handleApplyCouponCode()}
                  sx={{ fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
                >
                  Apply
                </Button>
              </Box>

              {/* Offer suggestions list */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                {sampleCoupons.map((coupon) => (
                  <Box key={coupon.code} sx={{ p: 1.8, border: '1px dashed #CBD5E1', borderRadius: 2, bgcolor: '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 850, color: 'secondary.main', fontSize: '0.85rem' }}>
                        {coupon.code}
                      </Typography>
                      <Button
                        size="small"
                        id={`apply-${coupon.code}`}
                        onClick={() => handleApplyCouponCode(coupon.code)}
                        sx={{ fontWeight: 700, fontSize: '0.72rem', p: '2px 8px', minWidth: 0 }}
                      >
                        Apply
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, lineHeight: 1.3 }}>
                      {coupon.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            <Box sx={{ mt: 3, p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ShieldIcon color="success" sx={{ fontSize: 24 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 650, lineHeight: 1.4 }}>
                Secure 256-bit SSL transaction encryption. Your payment information is encrypted and protected.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Professional Payment Processing / Success Modal */}
      <Dialog
        open={paymentModalOpen}
        disableEscapeKeyDown
        onClose={() => {}}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3.5, p: 2, textAlign: 'center' }
        }}
      >
        {paymentModalState === 'processing' && (
          <DialogContent sx={{ px: 3, py: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
              <CircularProgress size={56} thickness={4.5} color="secondary" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  Processing Payment...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {processingTime}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Please do not refresh or close the page.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        )}

        {paymentModalState === 'success' && (
          <DialogContent sx={{ px: 3, py: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: 'success.main', borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                <CheckCircleIcon sx={{ fontSize: 58, color: 'success.main' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main' }}>
                Payment Successful
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Booking Confirmed
              </Typography>

              {confirmedBookingData && (
                <Box sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2.5, p: 2.5, width: '100%', textAlign: 'left', mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Booking ID
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'secondary.main' }}>
                      {confirmedBookingData.pnr}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Payment Status
                    </Typography>
                    <Chip label="Successful" color="success" size="small" sx={{ fontWeight: 800, height: 20, fontSize: '0.7rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Amount Paid
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      ₹{confirmedBookingData.amount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Payment Method
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 750 }}>
                      {confirmedBookingData.method}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', mt: 2 }}>
                <Button
                  id="view-ticket-btn"
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  onClick={() => router.push('/my-tickets?success=true')}
                  startIcon={<ConfirmationNumberIcon />}
                  sx={{ fontWeight: 800, py: 1.3, borderRadius: 2 }}
                >
                  View Ticket
                </Button>
                <Button
                  id="go-to-my-tickets-btn"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => router.push('/my-tickets')}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Go to My Tickets
                </Button>
              </Box>
            </Box>
          </DialogContent>
        )}

        {paymentModalState === 'failure' && (
          <DialogContent sx={{ px: 3, py: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: 'error.main', borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                <ErrorOutlineIcon sx={{ fontSize: 58, color: 'error.main' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'error.main' }}>
                Payment Failed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
                {paymentValidationMsg || 'Your payment could not be completed.'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', mt: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  onClick={() => setPaymentModalOpen(false)}
                  sx={{ fontWeight: 800, py: 1.3, borderRadius: 2 }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => setPaymentModalOpen(false)}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Change Payment Method
                </Button>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading secure checkout..." />}>
      <CheckoutPageContent />
    </Suspense>
  );
}


