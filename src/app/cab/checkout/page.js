'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Chip,
  Avatar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  InputAdornment,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShieldIcon from '@mui/icons-material/Shield';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

import { getCabById, createCabBooking, validateCabCoupon } from '@/actions/cab';
import { CAB_OFFERS } from '@/lib/cabData';
import { formatINR } from '@/lib/cabFare';

const STEPS = ['Trip Details', 'Cab & Chauffeur', 'Passenger Details', 'Fare Summary', 'Payment'];

function detectCardType(number) {
  const clean = (number || '').replace(/\D/g, '');
  if (/^4/.test(clean)) return { name: 'Visa', color: '#1A1F71' };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: '#EB001B' };
  if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', color: '#097939' };
  if (/^3[47]/.test(clean)) return { name: 'Amex', color: '#006FCF' };
  return { name: 'Card', color: '#64748B' };
}

function CabCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const driverId = searchParams.get('driverId') || '';
  const pickup = searchParams.get('pickup') || 'Chennai';
  const drop = searchParams.get('drop') || 'Bangalore';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const time = searchParams.get('time') || '08:00 AM';
  const passengers = parseInt(searchParams.get('passengers') || '2', 10);
  const category = searchParams.get('category') || 'SEDAN';

  const [cabData, setCabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Stepper Step
  const [activeStep, setActiveStep] = useState(2); // Step 2: Passenger Details

  // Passenger Details Form
  const [passengerName, setPassengerName] = useState(session?.user?.name || 'Karthik Raja');
  const [passengerPhone, setPassengerPhone] = useState('9840123456');
  const [passengerEmail, setPassengerEmail] = useState(session?.user?.email || 'karthik@example.com');
  const [pickupAddress, setPickupAddress] = useState(`${pickup} Main Bus Station / Airport T1`);
  const [dropAddress, setDropAddress] = useState(`${drop} City Center`);
  const [formErrors, setFormErrors] = useState({});

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8891 2341 9012');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('884');
  const [cardHolder, setCardHolder] = useState('Karthik Raja');

  // Processing payment dialog
  const [processing, setProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');

  // Fetch Cab Details
  useEffect(() => {
    setLoading(true);
    getCabById(driverId, { pickup, drop, date, time, passengers })
      .then((res) => {
        if (res.success && res.data) {
          setCabData(res.data);
        } else {
          setError(res.error || 'Failed to retrieve cab details');
        }
      })
      .catch((err) => setError(err.message || 'Error loading cab'))
      .finally(() => setLoading(false));
  }, [driverId, pickup, drop, date, time, passengers]);

  // Handle Apply Coupon
  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput;
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const baseFareTotal = cabData?.totalFare || 899;
    const res = await validateCabCoupon(code, baseFareTotal);

    if (res.success && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponSuccess(`Coupon "${res.coupon.code}" applied! You saved ₹${res.discount}.`);
      setCouponInput(res.coupon.code);
    } else {
      setCouponError(res.error || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Form Validation
  const validatePassengerForm = () => {
    const errors = {};
    if (!passengerName || passengerName.trim().length < 2) {
      errors.passengerName = 'Please enter passenger full name';
    }
    if (!/^[6-9]\d{9}$/.test(passengerPhone)) {
      errors.passengerPhone = 'Please enter a valid 10-digit Indian mobile number';
    }
    if (!passengerEmail || !passengerEmail.includes('@')) {
      errors.passengerEmail = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Final Payment & Booking Submission
  const handleConfirmBooking = async () => {
    if (!validatePassengerForm()) {
      setActiveStep(2); // Jump back to passenger form
      return;
    }

    setProcessing(true);
    setProcessingText('Initiating secure encrypted payment channel...');

    setTimeout(async () => {
      setProcessingText('Validating driver real-time availability...');

      try {
        const payload = {
          driverId: cabData.id,
          pickup,
          drop,
          date,
          time,
          passengerName,
          passengerPhone,
          passengerEmail,
          passengersCount: passengers,
          pickupAddress,
          dropAddress,
          couponCode: appliedCoupon ? appliedCoupon.code : '',
          paymentMethod,
        };

        const res = await createCabBooking(payload);

        if (res.success && res.bookingId) {
          setProcessingText('Generating confirmed e-ticket & dispatching driver...');
          setTimeout(() => {
            router.push(`/cab/confirmation/${res.bookingId}`);
          }, 800);
        } else {
          setProcessing(false);
          setError(res.error || 'Booking failed. Please try another cab.');
        }
      } catch (err) {
        setProcessing(false);
        setError(err.message || 'Payment processing error');
      }
    }, 1200);
  };

  // Dynamic Total Calculation
  const finalDiscount = appliedCoupon
    ? appliedCoupon.isPercent
      ? Math.min(
          Math.round(((cabData?.fare?.subTotal || 899) * appliedCoupon.discount) / 100),
          appliedCoupon.maxDiscount || 500
        )
      : appliedCoupon.discount
    : 0;

  const finalTotal = Math.max(100, Math.round((cabData?.fare?.subTotal || 899) - finalDiscount));

  const cardType = detectCardType(cardNumber);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#D97706', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Preparing secure cab checkout...</Typography>
      </Container>
    );
  }

  if (error && !cabData) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => router.push('/cab/search')} sx={{ mt: 2, color: '#D97706', fontWeight: 800 }}>
          Back to Cab Search
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Top Stepper Banner */}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', py: 3, px: 2 }}>
        <Container maxWidth="md">
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label, idx) => (
              <Step key={label} completed={idx < activeStep}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: '#D97706' },
                      '&.Mui-completed': { color: '#059669' },
                    },
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 750, color: idx === activeStep ? '#D97706' : '#64748B' }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>

      {/* Main Checkout Grid */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3.5}>
          {/* Left Column: Passenger Info & Payment Modes */}
          <Grid item xs={12} md={7.5}>
            {/* Step 3: Passenger Information */}
            <Card sx={{ p: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3.5, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
                  1. Passenger & Contact Information
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your booking confirmation SMS, digital ticket pass, and driver tracking link will be sent to these details.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    error={Boolean(formErrors.passengerName)}
                    helperText={formErrors.passengerName}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="10-Digit Mobile Number"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    error={Boolean(formErrors.passengerPhone)}
                    helperText={formErrors.passengerPhone}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={passengerEmail}
                    onChange={(e) => setPassengerEmail(e.target.value)}
                    error={Boolean(formErrors.passengerEmail)}
                    helperText={formErrors.passengerEmail}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Pickup Address / Landmark"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Drop Address / Destination"
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Card>

            {/* Step 4: Simulated Payment Methods */}
            <Card sx={{ p: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
                  2. Choose Payment Method
                </Typography>
                <Chip icon={<ShieldIcon sx={{ fontSize: 16 }} />} label="100% Safe Demo Payment" size="small" color="success" sx={{ fontWeight: 800 }} />
              </Box>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {/* UPI Option */}
                  <Box sx={{ p: 2, borderRadius: 2.5, border: paymentMethod === 'upi' ? '2px solid #D97706' : '1px solid #E2E8F0', mb: 1.5, bgcolor: paymentMethod === 'upi' ? 'rgba(217, 119, 6, 0.04)' : '#FFFFFF' }}>
                    <FormControlLabel
                      value="upi"
                      control={<Radio sx={{ color: '#D97706', '&.Mui-checked': { color: '#D97706' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QrCode2Icon sx={{ color: '#D97706' }} />
                          <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>UPI (Google Pay / PhonePe / Paytm / QR)</Typography>
                        </Box>
                      }
                    />
                    {paymentMethod === 'upi' && (
                      <Box sx={{ pl: 4, pt: 1.5 }}>
                        <TextField
                          size="small"
                          label="Enter UPI ID / VPA"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          fullWidth
                          sx={{ maxWidth: 350 }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Card Option */}
                  <Box sx={{ p: 2, borderRadius: 2.5, border: paymentMethod === 'card' ? '2px solid #D97706' : '1px solid #E2E8F0', mb: 1.5, bgcolor: paymentMethod === 'card' ? 'rgba(217, 119, 6, 0.04)' : '#FFFFFF' }}>
                    <FormControlLabel
                      value="card"
                      control={<Radio sx={{ color: '#D97706', '&.Mui-checked': { color: '#D97706' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardIcon sx={{ color: '#0284C7' }} />
                          <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>Credit / Debit Card (Visa, Master, RuPay)</Typography>
                        </Box>
                      }
                    />
                    {paymentMethod === 'card' && (
                      <Box sx={{ pl: 4, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField
                          size="small"
                          label="Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          fullWidth
                          InputProps={{
                            endAdornment: <Chip label={cardType.name} size="small" sx={{ bgcolor: cardType.color, color: '#fff', fontWeight: 800 }} />,
                          }}
                        />
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <TextField size="small" label="Expiry" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} fullWidth />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField size="small" label="CVV (Simulated)" type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} fullWidth />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>

                  {/* Net Banking Option */}
                  <Box sx={{ p: 2, borderRadius: 2.5, border: paymentMethod === 'netbanking' ? '2px solid #D97706' : '1px solid #E2E8F0', mb: 1.5, bgcolor: paymentMethod === 'netbanking' ? 'rgba(217, 119, 6, 0.04)' : '#FFFFFF' }}>
                    <FormControlLabel
                      value="netbanking"
                      control={<Radio sx={{ color: '#D97706', '&.Mui-checked': { color: '#D97706' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceIcon sx={{ color: '#059669' }} />
                          <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>Net Banking (All Major Indian Banks)</Typography>
                        </Box>
                      }
                    />
                  </Box>

                  {/* Wallet Option */}
                  <Box sx={{ p: 2, borderRadius: 2.5, border: paymentMethod === 'wallet' ? '2px solid #D97706' : '1px solid #E2E8F0', bgcolor: paymentMethod === 'wallet' ? 'rgba(217, 119, 6, 0.04)' : '#FFFFFF' }}>
                    <FormControlLabel
                      value="wallet"
                      control={<Radio sx={{ color: '#D97706', '&.Mui-checked': { color: '#D97706' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceWalletIcon sx={{ color: '#7C3AED' }} />
                          <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>Mobile Wallets (Amazon Pay / Paytm)</Typography>
                        </Box>
                      }
                    />
                  </Box>
                </RadioGroup>
              </FormControl>

              {/* Pay Now Button */}
              <Box sx={{ mt: 3.5 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleConfirmBooking}
                  startIcon={<LockIcon />}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #D97706 0%, #B45309 60%, #92400E 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    py: 1.6,
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(217, 119, 6, 0.45)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      boxShadow: '0 12px 30px rgba(217, 119, 6, 0.6)',
                    },
                  }}
                >
                  PAY {formatINR(finalTotal)} & CONFIRM CAB
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Right Column: Selected Driver & Live Fare Summary */}
          <Grid item xs={12} md={4.5}>
            {/* Assigned Driver & Cab Card */}
            <Card sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" sx={{ color: '#D97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2 }}>
                Selected Cab & Chauffeur
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Avatar src={cabData?.avatar} alt={cabData?.name} sx={{ width: 56, height: 56, border: '2px solid #D97706' }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                      {cabData?.name}
                    </Typography>
                    <VerifiedUserIcon sx={{ fontSize: 16, color: '#059669' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    ⭐ {cabData?.rating} ({cabData?.trips} rides)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 750 }}>
                    {cabData?.vehicleModel} ({cabData?.vehicleNumber})
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Pickup Schedule</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{date} at {time}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Route</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{pickup} → {drop}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Est. Distance</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{cabData?.fare?.distanceKm || 350} km</Typography>
                </Box>
              </Box>
            </Card>

            {/* Working Coupon Engine */}
            <Card sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <LocalOfferIcon sx={{ color: '#D97706', fontSize: 18 }} />
                Apply Coupon Code
              </Typography>

              {!appliedCoupon ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Enter CAB50 or FIRSTCAB"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleApplyCoupon()}
                    sx={{ bgcolor: '#0F172A', fontWeight: 800, px: 2.5, '&:hover': { bgcolor: '#D97706' } }}
                  >
                    Apply
                  </Button>
                </Box>
              ) : (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(5, 150, 105, 0.1)', border: '1px dashed #059669', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#047857' }}>
                      {appliedCoupon.code} Applied!
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                      Savings: ₹{finalDiscount}
                    </Typography>
                  </Box>
                  <Button size="small" color="error" onClick={handleRemoveCoupon} sx={{ fontWeight: 800 }}>
                    Remove
                  </Button>
                </Box>
              )}

              {couponError && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                  {couponError}
                </Typography>
              )}
              {couponSuccess && !appliedCoupon && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                  {couponSuccess}
                </Typography>
              )}
            </Card>

            {/* Final Transparent Fare Summary */}
            <Card sx={{ p: 3, borderRadius: 3.5, border: '1px solid rgba(217, 119, 6, 0.3)', bgcolor: 'rgba(217, 119, 6, 0.04)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', mb: 2 }}>
                Fare Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Base Fare</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{cabData?.fare?.baseFare || 160}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Distance Fare ({cabData?.fare?.distanceKm || 15} km)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{cabData?.fare?.distanceFare || 650}</Typography>
                </Box>
                {(cabData?.fare?.tollCharges || 0) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Estimated Tolls</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{cabData?.fare?.tollCharges}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Safety & Service Fee</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{cabData?.fare?.serviceFee || 49}</Typography>
                </Box>
                {finalDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>Coupon Discount</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>-₹{finalDiscount}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>Total Payable</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#D97706' }}>
                    {formatINR(finalTotal)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Payment Processing Modal */}
      <Dialog open={processing} disableEscapeKeyDown PaperProps={{ sx: { borderRadius: 4, p: 3, textAlign: 'center', maxWidth: 380 } }}>
        <DialogContent>
          <CircularProgress size={56} sx={{ color: '#D97706', mb: 2.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: '#0F172A' }}>
            Processing Your Cab Booking
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {processingText}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default function CabCheckoutPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 10, textAlign: 'center' }}>Loading cab checkout...</Box>}>
      <CabCheckoutContent />
    </Suspense>
  );
}
