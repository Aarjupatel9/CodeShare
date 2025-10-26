import React from 'react';
import * as XLSX from 'xlsx';
import { generatePDF } from '../../generatePdf';
import toast from 'react-hot-toast';

export default function ExportOptionsModal({ 
    isOpen, 
    onClose, 
    auction, 
    teams, 
    teamPlayerMap 
}) {
    if (!isOpen) return null;

    // Excel Export Function
    const exportToExcel = () => {
        try {
            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // === SHEET 1: TEAMS SUMMARY ===
            const teamsData = teamPlayerMap.map((map, index) => {
                const team = teams.find(t => t._id === map.team);
                const teamBudgetUsed = map.players?.reduce((sum, p) => sum + (parseFloat(p.soldPrice) || 0), 0) || 0;
                const remainingBudget = (team?.budget || 0) - teamBudgetUsed;
                
                return {
                    'Team #': index + 1,
                    'Team Name': team?.name || 'Unknown',
                    'Owner': team?.owner || 'N/A',
                    'Total Budget': team?.budget || 0,
                    'Remaining Budget': remainingBudget,
                    'Players Count': map.players?.length || 0,
                    'Total Spent': teamBudgetUsed,
                    'Budget Used %': team?.budget ? Math.round((teamBudgetUsed / team.budget) * 100) : 0
                };
            });
            
            const teamsSheet = XLSX.utils.json_to_sheet(teamsData);
            
            // Set column widths for teams sheet
            teamsSheet['!cols'] = [
                { wch: 8 },   // Team #
                { wch: 20 },  // Team Name
                { wch: 15 },  // Owner
                { wch: 15 },  // Total Budget
                { wch: 18 },  // Remaining Budget
                { wch: 15 },  // Players Count
                { wch: 15 },  // Total Spent
                { wch: 15 }   // Budget Used %
            ];
            
            XLSX.utils.book_append_sheet(workbook, teamsSheet, 'Teams Summary');
            
            // === SHEET 2: PLAYERS DETAILS ===
            const playersData = [];
            teamPlayerMap.forEach((map, teamIndex) => {
                const team = teams.find(t => t._id === map.team);
                map.players?.forEach((player, playerIndex) => {
                    playersData.push({
                        'Player #': player.playerNumber || '',
                        'Player Name': player.name || '',
                        'Role': player.role || '',
                        'Team Name': team?.name || 'Unknown',
                        'Team #': teamIndex + 1,
                        'Base Price': player.basePrice || 0,
                        'Sold Price': player.soldPrice || 0,
                        'Sold Order': player.soldNumber || '',
                        'Profit/Loss': (player.soldPrice || 0) - (player.basePrice || 0),
                        'Price Multiple': player.basePrice ? Math.round(((player.soldPrice || 0) / player.basePrice) * 100) / 100 : 0
                    });
                });
            });
            
            const playersSheet = XLSX.utils.json_to_sheet(playersData);
            
            // Set column widths for players sheet
            playersSheet['!cols'] = [
                { wch: 10 },  // Player #
                { wch: 25 },  // Player Name
                { wch: 15 },  // Role
                { wch: 20 },  // Team Name
                { wch: 8 },   // Team #
                { wch: 12 },  // Base Price
                { wch: 12 },  // Sold Price
                { wch: 12 },  // Sold Order
                { wch: 12 },  // Profit/Loss
                { wch: 15 }   // Price Multiple
            ];
            
            XLSX.utils.book_append_sheet(workbook, playersSheet, 'Players Details');
            
            // === SHEET 3: AUCTION SUMMARY ===
            const totalTeams = teamPlayerMap.length;
            const totalPlayers = teamPlayerMap.reduce((sum, map) => sum + (map.players?.length || 0), 0);
            const totalBudget = teams.reduce((sum, team) => sum + (team.budget || 0), 0);
            const totalSpent = teamPlayerMap.reduce((sum, map) => 
                sum + (map.players?.reduce((playerSum, p) => playerSum + (parseFloat(p.soldPrice) || 0), 0) || 0), 0
            );
            const remainingBudget = totalBudget - totalSpent;
            
            const summaryData = [
                { 'Metric': 'Auction Name', 'Value': auction.name },
                { 'Metric': 'Export Date', 'Value': new Date().toLocaleString() },
                { 'Metric': '', 'Value': '' },
                { 'Metric': 'Total Teams', 'Value': totalTeams },
                { 'Metric': 'Total Players Sold', 'Value': totalPlayers },
                { 'Metric': 'Total Budget', 'Value': totalBudget },
                { 'Metric': 'Total Spent', 'Value': totalSpent },
                { 'Metric': 'Remaining Budget', 'Value': remainingBudget },
                { 'Metric': 'Budget Utilization %', 'Value': totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0 },
                { 'Metric': '', 'Value': '' },
                { 'Metric': 'Average Team Budget', 'Value': totalTeams ? Math.round(totalBudget / totalTeams) : 0 },
                { 'Metric': 'Average Player Price', 'Value': totalPlayers ? Math.round(totalSpent / totalPlayers) : 0 },
                { 'Metric': 'Players per Team', 'Value': totalTeams ? Math.round(totalPlayers / totalTeams) : 0 }
            ];
            
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            
            // Set column widths for summary sheet
            summarySheet['!cols'] = [
                { wch: 20 },  // Metric
                { wch: 20 }   // Value
            ];
            
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Auction Summary');
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `${auction.name}_teams_export_${timestamp}.xlsx`;
            
            // Download
            XLSX.writeFile(workbook, filename);
            toast.success('Excel file with multiple sheets downloaded successfully!');
            onClose();
        } catch (error) {
            console.error('Excel export error:', error);
            toast.error('Failed to export Excel file');
        }
    };

    // Enhanced PDF Export Function
    const exportToPDF = () => {
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `${auction.name}_final_team_list_${timestamp}`;
            
            // Use enhanced PDF generation - accurate to preview with reasonable file size
            generatePDF('finalTeamListView', filename);
            toast.success('High-quality PDF file downloaded successfully!');
            onClose();
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF file');
        }
    };

    // JSON Export Function
    const exportToJSON = () => {
        try {
            // Prepare comprehensive data
            const exportData = {
                auction: {
                    name: auction.name,
                    createdAt: auction.createdAt,
                    budget: auction.budget,
                    maxTeamMember: auction.maxTeamMember
                },
                teams: teamPlayerMap.map((map, index) => {
                    const team = teams.find(t => t._id === map.team);
                    const teamBudgetUsed = map.players?.reduce((sum, p) => sum + (parseFloat(p.soldPrice) || 0), 0) || 0;
                    
                    return {
                        teamNumber: index + 1,
                        teamInfo: {
                            name: team?.name || 'Unknown',
                            owner: team?.owner || 'N/A',
                            budget: team?.budget || 0,
                            remainingBudget: (team?.budget || 0) - teamBudgetUsed,
                            totalSpent: teamBudgetUsed
                        },
                        players: map.players?.map(player => ({
                            playerNumber: player.playerNumber,
                            name: player.name,
                            role: player.role,
                            basePrice: player.basePrice,
                            soldPrice: player.soldPrice,
                            soldNumber: player.soldNumber
                        })) || []
                    };
                }),
                summary: {
                    totalTeams: teamPlayerMap.length,
                    totalPlayers: teamPlayerMap.reduce((sum, map) => sum + (map.players?.length || 0), 0),
                    totalBudget: teams.reduce((sum, team) => sum + (team.budget || 0), 0),
                    totalSpent: teamPlayerMap.reduce((sum, map) => 
                        sum + (map.players?.reduce((playerSum, p) => playerSum + (parseFloat(p.soldPrice) || 0), 0) || 0), 0
                    ),
                    exportDate: new Date().toISOString()
                }
            };
            
            // Create and download JSON file
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `${auction.name}_teams_backup_${timestamp}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('JSON backup file downloaded successfully!');
            onClose();
        } catch (error) {
            console.error('JSON export error:', error);
            toast.error('Failed to export JSON file');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">📤</span>
                            <div>
                                <h2 className="text-2xl font-bold">Export Team List</h2>
                                <p className="text-blue-100">Choose your preferred export format</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-4">
                        {/* Excel Option */}
                        <button
                            onClick={exportToExcel}
                            className="w-full p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl group-hover:scale-110 transition-transform">📊</span>
                                <div className="flex-1">
                                    <h4 className="font-bold text-green-900 text-lg mb-1">Excel Format</h4>
                                    <p className="text-sm text-green-700 mb-2">Multi-sheet workbook with comprehensive team and player data</p>
                                    <div className="text-xs text-green-600">
                                        ✓ 3 separate sheets ✓ Team summary ✓ Player details ✓ Auction stats ✓ Easy to edit
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* PDF Option */}
                        <button
                            onClick={exportToPDF}
                            className="w-full p-6 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl group-hover:scale-110 transition-transform">📄</span>
                                <div className="flex-1">
                                    <h4 className="font-bold text-red-900 text-lg mb-1">PDF Format</h4>
                                    <p className="text-sm text-red-700 mb-2">High-quality print-ready document matching the preview exactly</p>
                                    <div className="text-xs text-red-600">
                                        ✓ Exact preview match ✓ Team logos ✓ Gradients preserved ✓ Print-ready
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* JSON Option */}
                        <button
                            onClick={exportToJSON}
                            className="w-full p-6 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 transition text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl group-hover:scale-110 transition-transform">💾</span>
                                <div className="flex-1">
                                    <h4 className="font-bold text-purple-900 text-lg mb-1">JSON Backup</h4>
                                    <p className="text-sm text-purple-700 mb-2">Complete data backup for restore or integration</p>
                                    <div className="text-xs text-purple-600">
                                        ✓ Complete data ✓ Machine-readable ✓ Backup/restore ✓ API integration
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-2">Export Summary:</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Teams:</span> {teamPlayerMap.length}
                            </div>
                            <div>
                                <span className="font-medium">Total Players:</span> {teamPlayerMap.reduce((sum, map) => sum + (map.players?.length || 0), 0)}
                            </div>
                            <div>
                                <span className="font-medium">Total Budget:</span> ₹{teams.reduce((sum, team) => sum + (team.budget || 0), 0).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-medium">Total Spent:</span> ₹{teamPlayerMap.reduce((sum, map) => 
                                    sum + (map.players?.reduce((playerSum, p) => playerSum + (parseFloat(p.soldPrice) || 0), 0) || 0), 0
                                ).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}