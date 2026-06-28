using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class AnalyticsControllerTests : ControllerTestBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly AnalyticsController _controller;

    public AnalyticsControllerTests()
    {
        _analyticsService = Substitute.For<IAnalyticsService>();
        _controller = new AnalyticsController(_analyticsService);
    }

    [Fact]
    public async Task GetDashboard_WithoutRange_ShouldUseDefault30d()
    {
        // Arrange
        var dashboard = new DashboardResponse
        {
            Kpis = [new KpiDto { Label = "Revenue", Value = "$1000" }],
            RevenuePoints = [new ChartPointDto { Label = "Jan", Value = 100m }],
            StudentPoints = [],
            RecentUsers = [],
        };
        _analyticsService.GetDashboardAsync("30d").Returns(dashboard);

        // Act
        var result = await _controller.GetDashboard();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<DashboardResponse>();
        returned.Kpis.Count.ShouldBe(1);
        await _analyticsService.Received(1).GetDashboardAsync("30d");
    }

    [Fact]
    public async Task GetDashboard_WithCustomRange_ShouldPassToService()
    {
        // Arrange
        _analyticsService.GetDashboardAsync("7d").Returns(new DashboardResponse());

        // Act
        var result = await _controller.GetDashboard("7d");

        // Assert
        result.Result.ShouldBeOfType<OkObjectResult>();
        await _analyticsService.Received(1).GetDashboardAsync("7d");
    }

    [Fact]
    public async Task GetAnalytics_WithoutRange_ShouldUseDefault1a()
    {
        // Arrange
        var response = new AnalyticsResponse
        {
            Mrr = 5000m,
            Arr = 60000m,
            GrowthPercent = 10m,
        };
        _analyticsService.GetAnalyticsAsync("1a").Returns(response);

        // Act
        var result = await _controller.GetAnalytics();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<AnalyticsResponse>();
        returned.Mrr.ShouldBe(5000m);
        await _analyticsService.Received(1).GetAnalyticsAsync("1a");
    }

    [Fact]
    public async Task GetAnalytics_WithCustomRange_ShouldPassToService()
    {
        // Arrange
        _analyticsService.GetAnalyticsAsync("90d").Returns(new AnalyticsResponse());

        // Act
        var result = await _controller.GetAnalytics("90d");

        // Assert
        result.Result.ShouldBeOfType<OkObjectResult>();
        await _analyticsService.Received(1).GetAnalyticsAsync("90d");
    }
}
