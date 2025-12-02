
terraform { # specifies cloud procider for infrastructure

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.17.0"
    }
  }

  required_version = ">= 1.13.4" # current verion requird
}

provider "aws" {
    region = "us-east-1" #AWS region where resource will be created
}


resource "aws_instance" "navigation_server" {
  ami           = "ami-0c94855ba95c71c99" #  amazon Machine Image for isntance
  instance_type = "t2.micro" #size of virtual machine
  
}

resource "aws_iam_role" "set_role" {
  name = "test_role"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    tag-key = "tag-value"
  }
}