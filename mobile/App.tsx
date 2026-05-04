import "react-native-get-random-values";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { WagmiProvider, useWalletClient, useAccount, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [injected()],
});

const queryClient = new QueryClient();

const CONTRACT_ADDRESSES = {
  HRToken: "0x0000000000000000000000000000000000000000",
  EmployeeRegistry: "0x0000000000000000000000000000000000000000",
  CredentialRegistry: "0x0000000000000000000000000000000000000000",
  PayrollExecutor: "0x0000000000000000000000000000000000000000",
  BenefitsNFT: "0x0000000000000000000000000000000000000000",
  HRGovernance: "0x0000000000000000000000000000000000000000",
  DIDRegistry: "0x0000000000000000000000000000000000000000"
};

function shortenAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function DashboardScreen() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "employees", label: "Employees" },
    { id: "credentials", label: "Credentials" },
    { id: "payroll", label: "Payroll" },
    { id: "governance", label: "Governance" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>D-HRS v2.0</Text>
        <View style={styles.headerRight}>
          <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
          <Text style={styles.statusText}>{isConnected ? "Connected" : "Disconnected"}</Text>
        </View>
      </View>

      {!isConnected ? (
        <View style={styles.connectContainer}>
          <Text style={styles.connectTitle}>Connect Your Wallet</Text>
          <Text style={styles.connectSubtitle}>Connect to manage your HR operations</Text>
          <Button
            title="Connect MetaMask"
            onPress={() => connect({ connector: connectors[0] })}
            color="#2563eb"
          />
        </View>
      ) : (
        <>
          <View style={styles.walletBar}>
            <Text style={styles.walletAddress}>{shortenAddress(address)}</Text>
            <TouchableOpacity onPress={() => disconnect()} style={styles.disconnectBtn}>
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.content}>
            {activeTab === "dashboard" && <DashboardContent />}
            {activeTab === "employees" && <EmployeesContent />}
            {activeTab === "credentials" && <CredentialsContent />}
            {activeTab === "payroll" && <PayrollContent />}
            {activeTab === "governance" && <GovernanceContent />}
          </ScrollView>
        </>
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function DashboardContent() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>System Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Total Employees</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Credentials</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Proposals</Text>
        </View>
      </View>
    </View>
  );
}

function EmployeesContent() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Employees</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.emptyText}>No employees registered yet</Text>
    </View>
  );
}

function CredentialsContent() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Credentials</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Issue</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.emptyText}>No credentials issued yet</Text>
    </View>
  );
}

function PayrollContent() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payroll</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Run</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.emptyText}>No payroll history</Text>
    </View>
  );
}

function GovernanceContent() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Governance</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Proposal</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.emptyText}>No active proposals</Text>
    </View>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DashboardScreen />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: "#10b981",
  },
  disconnected: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    fontSize: 12,
    color: "#64748b",
  },
  connectContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  connectSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center",
  },
  walletBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#2563eb",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  walletAddress: {
    color: "#fff",
    fontFamily: "monospace",
    fontSize: 14,
  },
  disconnectBtn: {
    padding: 4,
  },
  disconnectText: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 12,
    color: "#64748b",
  },
  activeTabText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    paddingVertical: 32,
  },
});
