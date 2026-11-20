import React, { useEffect, useMemo, useState } from "react";

import {
  Store,
  Users,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  X,
  RefreshCw,
  MessageCircle,
  AlertCircle,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "../css/StallForOrganiser.css";
import { apiFetch, isLoggedIn } from "../services/api";

const ORGANISER_KEY = "stalloraOrganiser";

const ITEMS_PER_PAGE = 52;

function readStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getOrganiserId(organiser) {
  return organiser?.id || organiser?.email || "organiser";
}

function formatDate(date) {
  if (!date) return "Not provided";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (typeof value === "number") {
    return `₹${value.toLocaleString("en-IN")}`;
  }

  const numeric = Number(String(value).replace(/[₹,\s]/g, ""));

  return Number.isNaN(numeric)
    ? String(value)
    : `₹${numeric.toLocaleString("en-IN")}`;
}

/* =========================================
   MEMBERSHIP PAYMENT CHECK
========================================= */

function hasPaidMembership(organiser) {
  if (!organiser) return false;

  const plan = String(
    organiser.membership ||
      organiser.membershipName ||
      organiser.planName ||
      "",
  ).toLowerCase();

  const validPlan = ["silver", "gold"].includes(plan);

  const membershipStatus = String(
    organiser.membershipStatus || organiser.membership_status || "",
  ).toLowerCase();

  const paymentVerified =
    organiser.paymentVerified === true || organiser.isPaymentVerified === true;

  return validPlan && membershipStatus === "active" && paymentVerified;
}

/* =========================================
   APPLICATION NORMALIZATION
========================================= */

function normalizeApplication(application, index) {
  return {
    ...application,
    id: application.id || application._id || `application-${index}`,
    vendorName:
      application.vendorName ||
      application.name ||
      application.fullName ||
      "Vendor",
    businessName:
      application.businessName ||
      application.business ||
      application.companyName ||
      "Business not provided",
    email: application.email || "Not provided",
    phone:
      application.phone ||
      application.mobile ||
      application.contactNumber ||
      "Not provided",
    status: application.status || "pending",
    isDemo: application.isDemo === true,
  };
}

/* =========================================
   MAIN COMPONENT
========================================= */

export default function StallForOrganiser() {
  const [organiser, setOrganiser] = useState(() =>
    readStorage(ORGANISER_KEY, null),
  );

  const [events, setEvents] = useState([]);

  // Vendor requests for this organiser's events (from the server)
  const [applications, setApplications] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [refreshing, setRefreshing] = useState(false);

  /* =========================================
     REFRESH STORAGE
  ========================================= */

  const refreshData = () => {
    setOrganiser(readStorage(ORGANISER_KEY, null));
    if (!isLoggedIn("organiser")) return Promise.resolve();
    return Promise.all([
      apiFetch("/events/mine", { role: "organiser" }).then(setEvents),
      apiFetch("/bookings/organiser", { role: "organiser" }).then(setApplications),
    ]).catch((error) => console.error("Unable to load applications:", error));
  };

  useEffect(() => {
    refreshData();

    const handleStorage = () => refreshData();

    window.addEventListener("storage", handleStorage);

    const interval = setInterval(refreshData, 30000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  /* =========================================
     MEMBERSHIP ACCESS
  ========================================= */

  const activeMembership = hasPaidMembership(organiser);

  /* =========================================
     REAL + DEMO APPLICATIONS
  ========================================= */

  const allApplications = useMemo(() => {
    const realApplications = Array.isArray(applications)
      ? applications.map(normalizeApplication)
      : [];

    return realApplications;
  }, [applications]);

  /* =========================================
     SEARCH AND FILTER
  ========================================= */

  const filteredApplications = useMemo(() => {
    let result = [...allApplications];

    if (statusFilter !== "all") {
      result = result.filter(
        (application) =>
          String(application.status).toLowerCase() ===
          statusFilter.toLowerCase(),
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((application) => {
        return (
          String(application.vendorName).toLowerCase().includes(search) ||
          String(application.businessName).toLowerCase().includes(search) ||
          String(application.email).toLowerCase().includes(search) ||
          String(application.phone).toLowerCase().includes(search)
        );
      });
    }

    return result;
  }, [allApplications, statusFilter, searchTerm]);

  /* =========================================
     CARD ACCESS RESTRICTION
  ========================================= */

  const accessLimitedApplications = activeMembership
    ? filteredApplications
    : filteredApplications.slice(0, 3);

  const totalPages = Math.max(
    1,
    Math.ceil(accessLimitedApplications.length / ITEMS_PER_PAGE),
  );

  const visibleApplications = accessLimitedApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeMembership]);

  /* =========================================
     APPLICATION STATUS UPDATE
  ========================================= */

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await apiFetch(`/bookings/${applicationId}`, {
        role: "organiser",
        method: "PATCH",
        body: { status: newStatus },
      });
    } catch (error) {
      window.alert(error.message);
      return;
    }

    const updatedApplications = applications.map((application) => {
      const matches =
        String(application.id) === String(applicationId) ||
        String(application._id) === String(applicationId);

      if (!matches) return application;

      return {
        ...application,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    setApplications(updatedApplications);

    setSelectedApplication((previous) => {
      if (!previous) return previous;

      if (String(previous.id || previous._id) === String(applicationId)) {
        return {
          ...previous,
          status: newStatus,
        };
      }

      return previous;
    });
  };

  /* =========================================
     REFRESH BUTTON
  ========================================= */

  const handleRefresh = () => {
    setRefreshing(true);

    Promise.resolve(refreshData()).finally(() => setRefreshing(false));
  };

  /* =========================================
     COUNTS
  ========================================= */

  const pendingCount = filteredApplications.filter(
    (application) => application.status === "pending",
  ).length;

  const approvedCount = filteredApplications.filter(
    (application) => application.status === "approved",
  ).length;

  const rejectedCount = filteredApplications.filter(
    (application) => application.status === "rejected",
  ).length;

  /* =========================================
     PAGE JSX
  ========================================= */

  return (
    <main className="stall-organiser-page">
      <div className="stall-organiser-container">
        <header className="stall-organiser-header">
          <div>
            <span className="stall-organiser-eyebrow">ORGANISER DASHBOARD</span>

            <h1>Stall Requests</h1>

            <p>Manage vendor applications for your events.</p>
          </div>

          <button
            type="button"
            className="stall-refresh-button"
            onClick={handleRefresh}
          >
            <RefreshCw size={17} className={refreshing ? "spinning" : ""} />
            Refresh
          </button>
        </header>

        {!activeMembership && (
          <div className="stall-membership-notice">
            <AlertCircle size={20} />

            <div>
              <strong>Limited access</strong>

              <p>
                You can view 3 vendor applications before purchasing a
                membership plan and completing payment. After successful payment
                verification, all applications will become available.
              </p>
            </div>
          </div>
        )}

        {activeMembership && (
          <div className="stall-membership-success">
            <CheckCircle size={20} />

            <span>
              Membership active. You can view all vendor applications.
            </span>
          </div>
        )}

        {/* SUMMARY CARDS */}

        <section className="stall-stats-grid">
          <div className="stall-stat-card">
            <div className="stall-stat-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Total Applications</span>
              <strong>{filteredApplications.length}</strong>
            </div>
          </div>

          <div className="stall-stat-card">
            <div className="stall-stat-icon pending">
              <Clock size={22} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="stall-stat-card">
            <div className="stall-stat-icon approved">
              <CheckCircle size={22} />
            </div>

            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
            </div>
          </div>

          <div className="stall-stat-card">
            <div className="stall-stat-icon rejected">
              <XCircle size={22} />
            </div>

            <div>
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>
        </section>

        {/* SEARCH AND FILTER */}

        <section className="stall-filter-section">
          <div className="stall-search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search vendor, business, email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="stall-status-filter"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </section>

        {/* APPLICATION LIST */}

        <section className="stall-applications-section">
          <div className="stall-section-heading">
            <div>
              <h2>Vendor Applications</h2>

              <p>
                Showing {visibleApplications.length} of{" "}
                {activeMembership
                  ? filteredApplications.length
                  : Math.min(filteredApplications.length, 3)}{" "}
                accessible applications
              </p>
            </div>

            <span className="stall-application-count">
              {activeMembership ? "Full Access" : "Preview Access"}
            </span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="stall-empty-state">
              <Store size={42} />

              <h3>No applications found</h3>

              <p>
                Applications will appear here when vendors submit their
                requests.
              </p>
            </div>
          ) : (
            <div className="stall-applications-grid">
              {visibleApplications.map((application, index) => {
                const isDemo = application.isDemo;

                return (
                  <article
                    className="stall-application-card"
                    key={application.id || application._id || index}
                  >
                    <div className="stall-card-top">
                      <span
                        className={`stall-status-badge ${application.status}`}
                      >
                        {application.status}
                      </span>

                      {isDemo && (
                        <span className="stall-demo-badge">Preview</span>
                      )}
                    </div>

                    <div className="stall-vendor-info">
                      <div className="stall-vendor-avatar">
                        {application.vendorName?.charAt(0)?.toUpperCase() ||
                          "V"}
                      </div>

                      <div>
                        <h3>{application.vendorName}</h3>

                        <p>{application.businessName}</p>
                      </div>
                    </div>

                    <div className="stall-card-details">
                      <div>
                        <Mail size={15} />
                        <span>{application.email}</span>
                      </div>

                      <div>
                        <Phone size={15} />
                        <span>{application.phone}</span>
                      </div>

                      <div>
                        <Store size={15} />
                        <span>
                          {application.category || "Category not provided"}
                        </span>
                      </div>

                      <div>
                        <CalendarDays size={15} />
                        <span>{formatDate(application.appliedAt)}</span>
                      </div>

                      <div>
                        <IndianRupee size={15} />
                        <span>{formatMoney(application.amount)}</span>
                      </div>
                    </div>

                    <div className="stall-card-actions">
                      <button
                        type="button"
                        className="stall-view-button"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>

                      {!isDemo && application.status === "pending" && (
                        <>
                          <button
                            type="button"
                            className="stall-approve-button"
                            onClick={() =>
                              updateApplicationStatus(
                                application.id || application._id,
                                "approved",
                              )
                            }
                          >
                            <CheckCircle size={16} />
                            Accept
                          </button>

                          <button
                            type="button"
                            className="stall-reject-button"
                            onClick={() =>
                              updateApplicationStatus(
                                application.id || application._id,
                                "rejected",
                              )
                            }
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="stall-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

        {/* APPLICATION DETAILS MODAL */}

        {selectedApplication && (
          <div
            className="stall-modal-overlay"
            onClick={() => setSelectedApplication(null)}
          >
            <div
              className="stall-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="stall-modal-header">
                <div>
                  <span>APPLICATION DETAILS</span>
                  <h2>{selectedApplication.vendorName}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                >
                  <X size={22} />
                </button>
              </div>

              <div className="stall-modal-body">
                <div className="stall-detail-row">
                  <span>Business Name</span>
                  <strong>{selectedApplication.businessName}</strong>
                </div>

                <div className="stall-detail-row">
                  <span>Vendor Name</span>
                  <strong>{selectedApplication.vendorName}</strong>
                </div>

                <div className="stall-detail-row">
                  <span>Email</span>
                  <strong>{selectedApplication.email}</strong>
                </div>

                <div className="stall-detail-row">
                  <span>Phone</span>
                  <strong>{selectedApplication.phone}</strong>
                </div>

                <div className="stall-detail-row">
                  <span>Category</span>
                  <strong>
                    {selectedApplication.category || "Not provided"}
                  </strong>
                </div>

                <div className="stall-detail-row">
                  <span>Event</span>
                  <strong>
                    {selectedApplication.eventName || "Not provided"}
                  </strong>
                </div>

                <div className="stall-detail-row">
                  <span>Stall Type</span>
                  <strong>
                    {selectedApplication.stallType || "Not provided"}
                  </strong>
                </div>

                <div className="stall-detail-row">
                  <span>Stall Size</span>
                  <strong>
                    {selectedApplication.stallSize || "Not provided"}
                  </strong>
                </div>

                <div className="stall-detail-row">
                  <span>Amount</span>
                  <strong>{formatMoney(selectedApplication.amount)}</strong>
                </div>

                <div className="stall-detail-row">
                  <span>Status</span>
                  <strong>{selectedApplication.status}</strong>
                </div>

                <div className="stall-detail-description">
                  <span>Description</span>

                  <p>
                    {selectedApplication.description ||
                      "No description provided."}
                  </p>
                </div>
              </div>

              <div className="stall-modal-footer">
                <button
                  type="button"
                  className="stall-modal-close"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </button>

                {!selectedApplication.isDemo &&
                  selectedApplication.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="stall-approve-button"
                        onClick={() =>
                          updateApplicationStatus(
                            selectedApplication.id || selectedApplication._id,
                            "approved",
                          )
                        }
                      >
                        <CheckCircle size={17} />
                        Accept
                      </button>

                      <button
                        type="button"
                        className="stall-reject-button"
                        onClick={() =>
                          updateApplicationStatus(
                            selectedApplication.id || selectedApplication._id,
                            "rejected",
                          )
                        }
                      >
                        <XCircle size={17} />
                        Reject
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
