using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ApplicationStatusDto : ApplicationStatusReflectedDto, IMpxProjection<ApplicationStatus, ApplicationStatusDto>
{
  public static new ApplicationStatusDto Projection => new();

  Expression<Func<ApplicationStatus, ApplicationStatusDto>> IMpxProjection<ApplicationStatus, ApplicationStatusDto>.BuildProjection() =>
      BuildProjectionFor<ApplicationStatusDto>();

  public static implicit operator Expression<Func<ApplicationStatus, ApplicationStatusDto>>(ApplicationStatusDto dto) =>
      dto.BuildProjectionFor<ApplicationStatusDto>();
}
