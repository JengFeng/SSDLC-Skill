using System.ComponentModel.DataAnnotations;

namespace TWNPPublic.Common.Attributes.CustomValidation
{
    public class ListWaterNoUnNull : ValidationAttribute
    {
        protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
                return new ValidationResult("您需至少綁定一個水號");
            var listOfWaterNo = value as IList<string>;

            if (listOfWaterNo == null)
                return new ValidationResult("您需至少綁定一個水號");

            foreach (var item in listOfWaterNo)
            {
                if(string.IsNullOrEmpty(item))
                    return new ValidationResult("水號不可以為空");
            }

            return ValidationResult.Success;
        }
    }
}
