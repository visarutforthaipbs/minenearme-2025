import React, { useEffect } from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import theme from "@/theme";
import { analytics } from "@/services/analytics";
import HomePage from "@/pages/HomePage";
import CaseStudies from "@/pages/CaseStudies";
import DataExplorer from "@/pages/DataExplorer";
import ReportImpact from "@/pages/ReportImpact";
import Learn from "@/pages/Learn";
import About from "@/pages/About";
import CaseDetail from "@/pages/CaseDetail";
import "@/i18n";
import NavBar from "@/components/NavBar";
import SEOHead from "@/components/SEOHead";

function App() {
  useEffect(() => {
    // Initialize Google Analytics with environment variable
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId) {
      analytics.initialize(measurementId);

      // Track initial page load
      analytics.trackPageView({
        content_group1: "Mining Impact Monitoring",
        content_group2: "Initial Load",
      });
    }
  }, []);

  return (
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <SEOHead />
        <Router>
          <NavBar />
          <Box as="main" w="100%">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cases" element={<CaseStudies />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
              <Route path="/explore" element={<DataExplorer />} />
              <Route path="/report" element={<ReportImpact />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Box>
        </Router>
      </ChakraProvider>
    </HelmetProvider>
  );
}

export default App;
