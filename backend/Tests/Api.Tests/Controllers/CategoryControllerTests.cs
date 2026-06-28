using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class CategoryControllerTests
{
    [Fact]
    public async Task GetAll_WhenCategoriesExist_ShouldReturnOkWithCategories()
    {
        // Arrange
        var service = Substitute.For<ICategoryService>();
        var categories = new List<Category>
        {
            new() { Id = Guid.NewGuid(), Name = "Backend" },
            new() { Id = Guid.NewGuid(), Name = "Frontend" },
        };
        service.GetAllAsync().Returns(Task.FromResult<IEnumerable<Category>>(categories));

        var controller = new CategoryController(service);

        // Act
        var result = await controller.GetAll();

        // Assert
        var okResult = result.ShouldBeOfType<OkObjectResult>();
        var returnedCategories = okResult.Value.ShouldBeOfType<List<Category>>();
        returnedCategories.Count.ShouldBe(2);
        returnedCategories[0].Name.ShouldBe("Backend");
        returnedCategories[1].Name.ShouldBe("Frontend");
    }

    [Fact]
    public async Task GetAll_WhenNoCategories_ShouldReturnOkWithEmptyList()
    {
        // Arrange
        var service = Substitute.For<ICategoryService>();
        service.GetAllAsync().Returns(Task.FromResult<IEnumerable<Category>>(new List<Category>()));

        var controller = new CategoryController(service);

        // Act
        var result = await controller.GetAll();

        // Assert
        var okResult = result.ShouldBeOfType<OkObjectResult>();
        var returnedCategories = okResult.Value.ShouldBeOfType<List<Category>>();
        returnedCategories.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetAll_WhenServiceThrows_ShouldPropagateException()
    {
        // Arrange
        var service = Substitute.For<ICategoryService>();
        service.GetAllAsync().Returns(Task.FromException<IEnumerable<Category>>(new Exception("DB error")));

        var controller = new CategoryController(service);

        // Act & Assert
        var ex = await Should.ThrowAsync<Exception>(() => controller.GetAll());
        ex.Message.ShouldBe("DB error");
    }
}
